import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import 'dotenv/config';
import { 
  getDatabase, 
  saveDatabase, 
  addReportToServer, 
  updateReportOnServer, 
  addAdoptionApplicationToServer, 
  updateAdoptionApplicationOnServer, 
  updatePetStatusOnServer, 
  savePetOnServer, 
  deletePetOnServer, 
  syncClientDataWithServer 
} from './server/liveDatabase';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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

// Internal email dispatcher used by endpoints and events
export async function sendInternalAdminEmail(params: {
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, any>;
  recipients?: string[];
}): Promise<{ delivered: boolean; provider: string; messageId?: string; error?: string }> {
  try {
    const { title, message, type = 'sistema', metadata, recipients } = params;
    const targetRecipients: string[] = Array.isArray(recipients) && recipients.length > 0 
      ? recipients 
      : DEFAULT_ADMIN_EMAILS;

    const emailConfig = getEmailConfig();
    const htmlBody = buildHtmlEmail(title, message, type, metadata);
    const subject = `[Pata Amiga Purificación - Admin] ${title}`;

    if (!emailConfig.configured) {
      console.warn('[Email Dispatch] Credenciales de correo no configuradas aún en .env');
      return { delivered: false, provider: 'none', error: 'No email credentials configured' };
    }

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
      const data = await resendRes.json();
      if (!resendRes.ok) {
        return { delivered: false, provider: 'resend', error: JSON.stringify(data) };
      }
      return { delivered: true, provider: 'resend', messageId: data.id };
    }

    const transporter = getTransporter();
    if (!transporter) {
      return { delivered: false, provider: 'smtp', error: 'No transporter available' };
    }

    const info = await transporter.sendMail({
      from: emailConfig.fromEmail,
      to: targetRecipients.join(', '),
      subject,
      text: `${title}\n\n${message}\n\nPata Amiga Purificación, Tolima`,
      html: htmlBody
    });

    return { delivered: true, provider: emailConfig.provider, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Internal Email Dispatch Error]', err);
    return { delivered: false, provider: 'error', error: err.message };
  }
}

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

    if (!emailConfig.configured) {
      console.warn('[Email Dispatch] Intento de envío de correo sin proveedor configurado en .env');
      return res.json({
        success: false,
        delivered: false,
        configured: false,
        provider: 'none',
        recipients: targetRecipients,
        subject: `[Pata Amiga Purificación - Admin] ${title}`,
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

    const result = await sendInternalAdminEmail({ title, message, type, metadata, recipients: targetRecipients });

    if (!result.delivered) {
      return res.status(500).json({ success: false, error: result.error, provider: result.provider });
    }

    return res.json({
      success: true,
      delivered: true,
      provider: result.provider,
      recipients: targetRecipients,
      messageId: result.messageId
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

// ==================== LIVE DATABASE & REAL-TIME SYNC API ROUTES ====================

// 1. Get full centralized database
app.get('/api/data', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    return res.json({ success: true, data: db });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 2. Full synchronization and merge
app.post('/api/data/sync', (req: Request, res: Response) => {
  try {
    const updatedDb = syncClientDataWithServer(req.body);
    return res.json({ success: true, data: updatedDb });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Create a new animal report (persisted globally across all devices & profiles)
app.post('/api/reports', async (req: Request, res: Response) => {
  try {
    const reportData = req.body;
    if (!reportData || !reportData.animalType) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos del reporte' });
    }
    const { report, state } = addReportToServer(reportData);

    // Fire automatic email alert to the 4 administrators
    sendInternalAdminEmail({
      title: `🚨 Nuevo Reporte Animal en Purificación: ${report.animalType}`,
      message: `Se ha recibido un nuevo reporte de rescate en el barrio ${report.neighborhood || 'Purificación Tolima'}.\n\nUrgencia: ${report.urgency || 'Normal'}\nDirección: ${report.addressDetails || 'Purificación Tolima'}\nReportante: ${report.reporterName || 'Anónimo'} (Tel: ${report.reporterPhone || 'Sin teléfono'})\nDescripción: ${report.description || 'Sin descripción'}`,
      type: 'reporte',
      metadata: {
        'Tipo de Animal': report.animalType,
        'Barrio': report.neighborhood,
        'Urgencia': report.urgency,
        'Reportante': `${report.reporterName} (${report.reporterPhone})`,
        'Fecha': report.reportedAt || new Date().toLocaleString()
      }
    }).catch(e => console.warn('[Auto-Email Report Alert Error]', e?.message));

    return res.json({ success: true, report, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 4. Update animal report (status, assigned rescuer, admin notes)
app.patch('/api/reports/:id', (req: Request, res: Response) => {
  try {
    const { report, state } = updateReportOnServer(req.params.id, req.body);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    }
    return res.json({ success: true, report, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 5. Submit adoption application (updates pet to 'en_proceso' globally across all devices & profiles)
app.post('/api/adoption-applications', async (req: Request, res: Response) => {
  try {
    const appData = req.body;
    if (!appData || !appData.petId || !appData.applicantName) {
      return res.status(400).json({ success: false, error: 'Faltan datos de la postulación' });
    }
    const { application, state } = addAdoptionApplicationToServer(appData);

    // Fire automatic email alert to the 4 administrators
    sendInternalAdminEmail({
      title: `🐾 Nueva Postulación de Adopción: ${application.petName}`,
      message: `${application.applicantName} se ha postulado para adoptar a ${application.petName} en Purificación Tolima.\n\nTeléfono: ${application.applicantPhone}\nCorreo: ${application.applicantEmail}\nCiudad/Sector: ${application.applicantCity}\nTipo de vivienda: ${application.housingType}\nMotivo: ${application.reasonForAdoption}`,
      type: 'adopcion',
      metadata: {
        'Mascota': application.petName,
        'Postulante': application.applicantName,
        'Teléfono': application.applicantPhone,
        'Correo': application.applicantEmail,
        'Vivienda': application.housingType,
        'Fecha': application.submittedAt || new Date().toLocaleString()
      }
    }).catch(e => console.warn('[Auto-Email Adoption Alert Error]', e?.message));

    return res.json({ success: true, application, pets: state.pets, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 6. Update adoption application status (Approve -> marks pet 'adoptado', Reject -> marks pet 'disponible')
app.patch('/api/adoption-applications/:id', (req: Request, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Se requiere el estado de la postulación' });
    }
    const { application, state } = updateAdoptionApplicationOnServer(req.params.id, status, adminNote);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Postulación no encontrada' });
    }
    return res.json({ success: true, application, pets: state.pets, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 7. Update pet status or details
app.patch('/api/pets/:id', (req: Request, res: Response) => {
  try {
    if (req.body.status && Object.keys(req.body).length === 1) {
      const { pet, state } = updatePetStatusOnServer(req.params.id, req.body.status);
      return res.json({ success: true, pet, data: state });
    }
    const db = getDatabase();
    const existing = db.pets.find(p => p.id === req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Mascota no encontrada' });
    }
    const updatedPet = { ...existing, ...req.body };
    const { pet, state } = savePetOnServer(updatedPet);
    return res.json({ success: true, pet, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 8. Add new pet to catalog
app.post('/api/pets', (req: Request, res: Response) => {
  try {
    const { pet, state } = savePetOnServer(req.body);
    return res.json({ success: true, pet, data: state });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 9. Delete pet from catalog
app.delete('/api/pets/:id', (req: Request, res: Response) => {
  try {
    const { state } = deletePetOnServer(req.params.id);
    return res.json({ success: true, data: state });
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
