/**
 * VISTAVIEW REAL EMAIL SERVICE
 * Uses Nodemailer with SMTP/SendGrid/AWS SES
 */

const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const pool = new Pool({ database: 'vistaview', host: 'localhost', port: 5432 });

// Email configuration (set via environment variables)
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
};

// Default sender
const DEFAULT_FROM = process.env.EMAIL_FROM || 'VistaView AI <noreply@vistaview.ai>';

// Create transporter (lazy init)
let transporter = null;

function getTransporter() {
    if (!transporter) {
        if (EMAIL_CONFIG.auth.user) {
            transporter = nodemailer.createTransport(EMAIL_CONFIG);
        } else {
            // Use ethereal for testing
            console.log('[EMAIL] No SMTP configured, using test mode');
            transporter = {
                sendMail: async (options) => {
                    console.log('[EMAIL-TEST]', options.to, options.subject);
                    return { messageId: `test-${Date.now()}`, testMode: true };
                }
            };
        }
    }
    return transporter;
}

/**
 * Send email immediately
 */
async function sendEmail(to, subject, html, text = null, options = {}) {
    const { from = DEFAULT_FROM, cc, bcc, attachments, replyTo } = options;
    
    console.log(`[EMAIL] Sending to ${to}: ${subject}`);
    
    try {
        const mailOptions = {
            from,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
            cc,
            bcc,
            attachments,
            replyTo
        };
        
        const result = await getTransporter().sendMail(mailOptions);
        
        // Log to database
        await pool.query(`
            INSERT INTO email_queue 
            (recipient_email, subject, body_html, body_text, status, sent_at, attempts)
            VALUES ($1, $2, $3, $4, 'sent', NOW(), 1)
        `, [to, subject, html, text]);
        
        // Update stats
        await pool.query(`
            UPDATE learning_stats SET emails_sent = COALESCE(emails_sent, 0) + 1, updated_at = NOW()
            WHERE stat_date = CURRENT_DATE
        `);
        
        return { success: true, messageId: result.messageId, testMode: result.testMode };
        
    } catch (error) {
        console.error(`[EMAIL] Error:`, error.message);
        
        await pool.query(`
            INSERT INTO email_queue 
            (recipient_email, subject, body_html, status, error_message, attempts)
            VALUES ($1, $2, $3, 'failed', $4, 1)
        `, [to, subject, html, error.message]);
        
        return { success: false, error: error.message };
    }
}

/**
 * Queue email for later sending
 */
async function queueEmail(to, subject, html, text = null, options = {}) {
    const { priority = 5, relatedTable, relatedId } = options;
    
    const result = await pool.query(`
        INSERT INTO email_queue 
        (recipient_email, subject, body_html, body_text, priority, related_table, related_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING id
    `, [to, subject, html, text, priority, relatedTable, relatedId]);
    
    return { success: true, emailId: result.rows[0].id, queued: true };
}

/**
 * Process pending email queue
 */
async function processQueue(limit = 10) {
    console.log('[EMAIL] Processing queue...');
    
    const pending = await pool.query(`
        SELECT * FROM email_queue 
        WHERE status = 'pending' AND attempts < 3
        ORDER BY priority DESC, created_at ASC
        LIMIT $1
    `, [limit]);
    
    const results = [];
    for (const email of pending.rows) {
        await pool.query(`UPDATE email_queue SET status = 'sending', attempts = attempts + 1 WHERE id = $1`, [email.id]);
        
        const result = await sendEmail(
            email.recipient_email,
            email.subject,
            email.body_html,
            email.body_text
        );
        
        await pool.query(`
            UPDATE email_queue SET 
                status = $1,
                sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE NULL END,
                error_message = $2
            WHERE id = $3
        `, [result.success ? 'sent' : 'failed', result.error, email.id]);
        
        results.push({ emailId: email.id, ...result });
    }
    
    return { processed: results.length, results };
}

/**
 * Send email using template
 */
async function sendTemplateEmail(to, templateName, variables = {}, options = {}) {
    // Get template
    const template = await pool.query(`
        SELECT * FROM email_templates WHERE template_name = $1 AND is_active = true
    `, [templateName]);
    
    if (template.rows.length === 0) {
        return { success: false, error: `Template '${templateName}' not found` };
    }
    
    const t = template.rows[0];
    
    // Replace variables
    let subject = t.subject_template;
    let html = t.body_html_template;
    let text = t.body_text_template;
    
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        html = html.replace(regex, value);
        if (text) text = text.replace(regex, value);
    }
    
    return sendEmail(to, subject, html, text, options);
}

/**
 * Send notification to boss/team
 */
async function notifyTeam(type, data) {
    const recipients = {
        boss: process.env.BOSS_EMAIL || 'boss@vistaview.ai',
        team: process.env.TEAM_EMAIL || 'team@vistaview.ai'
    };
    
    switch (type) {
        case 'high_risk':
            return sendTemplateEmail(recipients.boss, 'alert_high_risk', data, { priority: 10 });
        case 'daily_report':
            return sendTemplateEmail(recipients.team, 'daily_report', data);
        case 'confirmation':
            return sendTemplateEmail(recipients.boss, 'confirmation_required', data, { priority: 8 });
        default:
            return { success: false, error: 'Unknown notification type' };
    }
}

module.exports = {
    sendEmail,
    queueEmail,
    processQueue,
    sendTemplateEmail,
    notifyTeam
};

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args[0] === 'process') {
        processQueue(parseInt(args[1]) || 10).then(r => {
            console.log('Result:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else if (args[0] === 'test') {
        sendEmail(args[1] || 'test@example.com', 'Test Email', '<h1>Hello from VistaView!</h1>').then(r => {
            console.log('Result:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else {
        console.log('Usage: node real-email.cjs test [email]');
        console.log('       node real-email.cjs process [limit]');
    }
}
