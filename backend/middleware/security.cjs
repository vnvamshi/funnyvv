// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW SECURITY MIDDLEWARE
// Protects APIs from hacking, rate limiting, input validation
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

const rateLimit = require('express-rate-limit');

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING - Prevent brute force & DDoS
// ═══════════════════════════════════════════════════════════════════════════════

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 mins
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for sensitive endpoints
  message: { error: 'Rate limit exceeded' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 API calls per minute
  message: { error: 'API rate limit exceeded' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════════

const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // Remove potential XSS
        req.query[key] = req.query[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    }
  }

  // Sanitize body
  if (req.body) {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(req.body);
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// SQL INJECTION PREVENTION
// ═══════════════════════════════════════════════════════════════════════════════

const sqlInjectionCheck = (req, res, next) => {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION(\s+)SELECT/i,
    /INSERT(\s+)INTO/i,
    /DELETE(\s+)FROM/i,
    /DROP(\s+)TABLE/i,
    /UPDATE(\s+)\w+(\s+)SET/i,
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check query params
  for (const key in req.query) {
    if (checkValue(req.query[key])) {
      console.warn(`[SECURITY] SQL injection attempt blocked: ${req.ip} - ${req.query[key]}`);
      return res.status(400).json({ error: 'Invalid input detected' });
    }
  }

  // Check body
  const checkObject = (obj) => {
    for (const key in obj) {
      if (checkValue(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body && checkObject(req.body)) {
    console.warn(`[SECURITY] SQL injection attempt blocked: ${req.ip}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (allow affiliate links)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'self';"
  );

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTE PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;

  // In production, use environment variable
  const validAdminKey = process.env.ADMIN_API_KEY || 'vistaview-admin-2026';

  if (!adminKey || adminKey !== validAdminKey) {
    console.warn(`[SECURITY] Unauthorized admin access attempt: ${req.ip} - ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// IP BLOCKING (for persistent bad actors)
// ═══════════════════════════════════════════════════════════════════════════════

const blockedIPs = new Set();
const suspiciousActivity = new Map(); // IP -> count

const ipBlocker = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (blockedIPs.has(ip)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Track suspicious activity
  const count = suspiciousActivity.get(ip) || 0;
  if (count > 50) {
    blockedIPs.add(ip);
    console.warn(`[SECURITY] IP blocked for suspicious activity: ${ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

const markSuspicious = (ip) => {
  const count = suspiciousActivity.get(ip) || 0;
  suspiciousActivity.set(ip, count + 1);
};

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING (for security monitoring)
// ═══════════════════════════════════════════════════════════════════════════════

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      status: res.statusCode,
      duration: `${duration}ms`
    };

    // Log errors and suspicious activity
    if (res.statusCode >= 400) {
      console.warn('[SECURITY]', JSON.stringify(log));
    }
  });

  next();
};

module.exports = {
  generalLimiter,
  strictLimiter,
  apiLimiter,
  sanitizeInput,
  sqlInjectionCheck,
  securityHeaders,
  adminAuth,
  ipBlocker,
  markSuspicious,
  requestLogger
};
