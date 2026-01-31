#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// AFFILIATE LINK AUDITOR - vistaview.live
// Checks if all affiliate partner URLs are working
// Run: node scripts/audit-affiliate-links.js
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

const https = require('https');
const http = require('http');

// Sample partner URLs to test
const PARTNER_URLS = [
  { name: 'Amazon US', url: 'https://www.amazon.com' },
  { name: 'Amazon India', url: 'https://www.amazon.in' },
  { name: 'Amazon UK', url: 'https://www.amazon.co.uk' },
  { name: 'Wayfair', url: 'https://www.wayfair.com' },
  { name: 'IKEA US', url: 'https://www.ikea.com/us/en' },
  { name: 'Flipkart', url: 'https://www.flipkart.com' },
  { name: 'Pepperfry', url: 'https://www.pepperfry.com' },
  { name: 'Target', url: 'https://www.target.com' },
  { name: 'Walmart', url: 'https://www.walmart.com' },
  { name: 'Overstock', url: 'https://www.overstock.com' },
  { name: 'West Elm', url: 'https://www.westelm.com' },
  { name: 'John Lewis', url: 'https://www.johnlewis.com' },
  { name: 'Made.com', url: 'https://www.made.com' }
];

async function checkUrl(partner) {
  return new Promise((resolve) => {
    const protocol = partner.url.startsWith('https') ? https : http;
    const startTime = Date.now();

    const req = protocol.get(partner.url, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name: partner.name,
        url: partner.url,
        status: res.statusCode,
        responseTime: responseTime,
        ok: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('error', (err) => {
      resolve({
        name: partner.name,
        url: partner.url,
        status: 'ERROR',
        error: err.message,
        ok: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: partner.name,
        url: partner.url,
        status: 'TIMEOUT',
        ok: false
      });
    });
  });
}

async function runAudit() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  VISTAVIEW.LIVE AFFILIATE LINK AUDIT');
  console.log('  ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  for (const partner of PARTNER_URLS) {
    const result = await checkUrl(partner);
    results.push(result);

    const status = result.ok ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    console.log(`${status} ${partner.name.padEnd(20)} ${String(result.status).padEnd(10)} ${time}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log(`\nSUMMARY: ${passed} passed, ${failed} failed out of ${results.length} partners`);

  if (failed > 0) {
    console.log('\n❌ FAILED PARTNERS:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`   - ${r.name}: ${r.status} ${r.error || ''}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All partner links are working!');
    process.exit(0);
  }
}

runAudit().catch(console.error);
