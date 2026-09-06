import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(express.json());

const DEFAULT_ADMIN_EMAILS = [
  'gascadanna414@gmail.com',
  'sofiaaa.123791@gmail.com',
  'adrianamacana2@gmail.com',
  'marimasmela15@gmail.com'
];

interface EmailConfig {
  configured: boolean;
  provider: 'gmail' | 'smtp' | 'resend' | 'none';
  fromEmail: string;
}

function getEmailConfig(): EmailConfig {
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  
  if (gmailUser && gmailPass) {
    return {
      configured: true,
      provider: 'gmail',
      fromEmail: `"Pata Amiga Purificación" <${gmailUser}>`
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return {
      configured: true,
      provider: 'smtp',
      fromEmail: process.env.SMTP_FROM || `"Pata Amiga Purificación" <${smtpUser}>`
    };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return {
      configured: true,
      provider: 'resend',
      fromEmail: process.env.RESEND_FROM || 'Pata Amiga <onboarding@resend.dev>'
    };
  }

  return {
    configured: false,
    provider: 'none',
    fromEmail: ''
  };
}

function getTransporter() {
  const config = getEmailConfig();
  if (config.provider === 'gmail') {
    const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  if (config.provider === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return null;
}

function buildHtmlEmail(title: string, message: string, type: string, metadata?: any): string {
  const isReport = type === 'reporte';
  const isAdoption = type === 'adopcion';
  const headerBg = isReport ? '#DC2626' : isAdoption ? '#D97706' : '#2C1E14';
  const badgeText = isReport ? '🚨 REPORTE DE RESCATE' : isAdoption ? '🐾 POSTULACIÓN DE ADOPCIÓN' : '📩 MENSAJE RECIBIDO';

  let metadataHtml = '';
  if (metadata) {
    metadataHtml = `
      <div style="background-color: #FAF6F0; border: 1px solid #E8DFD3; border-radius: 12px; padding: 16px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h4 style="margin: 0 0 10px 0; color: #2C1E14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles Clave</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #5C4538;">
          ${Object.entries(metadata).map(([k, v]) => `
            <tr>
              <td style="padding: 4px 0; font-weight: bold; width: 40%; color: #2C1E14;">${escapeHtml(k)}:</td>
              <td style="padding: 4px 0;">${escapeHtml(String(v))}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#F5EDE2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(44,30,20,0.08); border: 1px solid #EAE2D5;">
          <!-- Header -->
          <tr>
            <td style="background-color: ${headerBg}; padding: 24px 30px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255,255,255,0.25); color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">
                ${badgeText}
              </span>
              <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 4px 0; font-family: Georgia, serif; line-height: 1.3;">
                ${escapeHtml(title)}
              </h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 0;">
                Pata Amiga Purificación • Tolima
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; color: #2C1E14;">
              <p style="font-size: 15px; line-height: 1.6; color: #3D2C1F; margin: 0 0 16px 0;">
                ${escapeHtml(message)}
              </p>

              ${metadataHtml}

              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #EAE2D5; text-align: center;">
                <p style="font-size: 12px; color: #8A7568; margin-bottom: 12px;">
                  Alerta administrativa enviada en tiempo real a las 4 administradoras autorizadas de Pata Amiga Purificación.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6F0; padding: 18px 30px; border-top: 1px solid #EAE2D5; text-align: center; color: #8A7568; font-size: 11px;">
              <strong>Pata Amiga Purificación, Tolima</strong><br>
              Defensa, Rescate y Bienestar Animal • Purificación, Colombia
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- API ROUTES ---

// Check email configuration status
app.get('/api/email/status', (req: Request, res: Response) => {
  const config = getEmailConfig();
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const smtpUser = process.env.SMTP_USER;

  res.json({
    configured: config.configured,
    provider: config.provider,
    account: gmailUser ? `${gmailUser.split('@')[0].slice(0, 3)}***@gmail.com` : (smtpUser || null),
    recipients: DEFAULT_ADMIN_EMAILS,
    instructions: config.configured 
      ? 'Servidor de correo activo y listo para enviar notificaciones reales a la bandeja de entrada.'
      : 'Para recibir correos reales en Gmail, configura GMAIL_USER y GMAIL_APP_PASSWORD en las variables de entorno de la aplicación.'
  });
});

// Dispatch real email alert to all administrators
app.post('/api/email/send-admin-alert', async (req: Request, res: Response) => {
  try {
    const { title, message, type = 'sistema', metadata, recipients } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'title and message are required' });
    }

    const targetRecipients: string[] = Array.isArray(recipients) && recipients.length > 0 
      ? recipients 
      : DEFAULT_ADMIN_EMAILS;

    const emailConfig = getEmailConfig();
    const htmlBody = buildHtmlEmail(title, message, type, metadata);
    const subject = `[Pata Amiga Purificación - Admin] ${title}`;

    if (!emailConfig.configured) {
      console.warn('[Email Dispatch] Intento de envío de correo sin proveedor configurado en .env');
      return res.json({
        success: false,
        delivered: false,
        configured: false,
        provider: 'none',
        recipients: targetRecipients,
        subject,
        message: 'Credenciales de correo no configuradas aún en variables de entorno.',
        instructions: {
          recommended: 'Gmail SMTP',
          steps: [
            '1. Ve a tu cuenta de Google > Seguridad > Verificación en 2 pasos.',
            '2. Crea una "Contraseña de aplicaciones" para "Pata Amiga".',
            '3. Configura en las variables de entorno: GMAIL_USER=tu_correo@gmail.com y GMAIL_APP_PASSWORD=tu_contraseña_de_16_letras.',
            '4. ¡Listo! Los correos llegarán instantáneamente a todos los administradores.'
          ]
        }
      });
    }

    // 1. Send via Resend REST API if configured
    if (emailConfig.provider === 'resend') {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: emailConfig.fromEmail,
          to: targetRecipients,
          subject,
          html: htmlBody
        })
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        console.error('[Resend Error]', resendData);
        return res.status(500).json({ success: false, error: resendData, provider: 'resend' });
      }

      console.info(`[Email Sent via Resend] Despachado a ${targetRecipients.join(', ')}`);
      return res.json({
        success: true,
        delivered: true,
        provider: 'resend',
        recipients: targetRecipients,
        data: resendData
      });
    }

    // 2. Send via Nodemailer (Gmail SMTP or generic SMTP)
    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ success: false, error: 'No transporter available' });
    }

    const mailOptions = {
      from: emailConfig.fromEmail,
      to: targetRecipients.join(', '),
      subject,
      text: `${title}\n\n${message}\n\nPata Amiga Purificación, Tolima`,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.info(`[Email Sent via ${emailConfig.provider}] Despachado con éxito a: ${targetRecipients.join(', ')} (ID: ${info.messageId})`);

    return res.json({
      success: true,
      delivered: true,
      provider: emailConfig.provider,
      recipients: targetRecipients,
      messageId: info.messageId
    });

  } catch (err: any) {
    console.error('[Email Dispatch Error]', err);
    return res.status(500).json({
      success: false,
      delivered: false,
      error: err.message || 'Error desconocido al enviar el correo electrónico',
      recipients: DEFAULT_ADMIN_EMAILS
    });
  }
});

// Test email endpoint
app.post('/api/email/test', async (req: Request, res: Response) => {
  const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const title = 'Prueba de Conexión de Notificaciones por Correo';
  const message = `Este es un correo de comprobación de Pata Amiga Purificación enviado a las ${now}. Si recibes este mensaje en tu bandeja de entrada de Gmail, el servicio de despacho automático está funcionando al 100%.`;

  // Delegate to send-admin-alert
  req.body = {
    title,
    message,
    type: 'sistema',
    metadata: {
      'Fecha y Hora': now,
      'Canal': 'Verificación de Servidor',
      'Administradores Destinatarios': DEFAULT_ADMIN_EMAILS.length
    },
    recipients: DEFAULT_ADMIN_EMAILS
  };

  const fakeNext = () => {};
  // Call internal handler
  try {
    const emailConfig = getEmailConfig();
    if (!emailConfig.configured) {
      return res.json({
        success: false,
        delivered: false,
        configured: false,
        recipients: DEFAULT_ADMIN_EMAILS,
        message: 'No hay credenciales de correo configuradas en el servidor. Configura GMAIL_USER y GMAIL_APP_PASSWORD en las variables de entorno para que el correo llegue a tu bandeja de Gmail.'
      });
    }

    const htmlBody = buildHtmlEmail(title, message, 'sistema', {
      'Fecha y Hora': now,
      'Canal': 'Verificación de Servidor',
      'Administradores Destinatarios': DEFAULT_ADMIN_EMAILS.length
    });
    const subject = `[Pata Amiga Purificación - Admin] ${title}`;

    if (emailConfig.provider === 'resend') {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: emailConfig.fromEmail,
          to: DEFAULT_ADMIN_EMAILS,
          subject,
          html: htmlBody
        })
      });
      const data = await resendRes.json();
      return res.json({ success: true, delivered: true, provider: 'resend', recipients: DEFAULT_ADMIN_EMAILS, data });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ success: false, error: 'No transporter available' });
    }

    const info = await transporter.sendMail({
      from: emailConfig.fromEmail,
      to: DEFAULT_ADMIN_EMAILS.join(', '),
      subject,
      text: `${title}\n\n${message}`,
      html: htmlBody
    });

    return res.json({
      success: true,
      delivered: true,
      provider: emailConfig.provider,
      recipients: DEFAULT_ADMIN_EMAILS,
      messageId: info.messageId
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Start server with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
