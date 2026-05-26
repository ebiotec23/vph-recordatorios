import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { emails, subject, comuna, fecha } = await req.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron correos electrónicos.' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Credenciales de correo no configuradas en el servidor.' }, { status: 500 });
    }

    // Configure Nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border-top: 6px solid #db2777;">
                
                <!-- Simple Header -->
                <tr>
                  <td align="center" style="padding: 32px 32px 0 32px;">
                    <span style="color: #be185d; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: block;">Programa piloto de pesquisa de VPH</span>
                    <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-top: 4px;">Universidad Católica del Norte</span>
                  </td>
                </tr>
                
                <!-- Content / Hero -->
                <tr>
                  <td style="padding: 24px 32px 32px 32px; color: #1f2937; font-size: 16px; line-height: 1.6; text-align: left;">
                    <h1 style="color: #111827; font-size: 24px; margin-top: 0; margin-bottom: 24px; text-align: center;">Recordatorio de retiro de muestra de orina</h1>
                    
                    <p>Estimado/a participante de <strong>${comuna}</strong>,</p>
                    <p>Le recordamos que el retiro de su muestra de orina del Proyecto VPH está programado para el día:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                      <span style="font-size: 18px; font-weight: 600; color: #1f2937;">${fecha}</span>
                    </div>
                  </td>
                </tr>

                <!-- Call to Action Box (Vital) -->
                <tr>
                  <td style="padding: 0 32px 40px 32px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f8; border: 2px solid #fbcfe8; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 24px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="left" valign="middle" style="padding-right: 20px;">
                                <h2 style="color: #be185d; margin: 0 0 12px 0; font-size: 18px;">⚠️ Instrucción de toma de muestra</h2>
                                <p style="color: #9d174d; font-size: 15px; line-height: 1.5; margin: 0 0 12px 0;">
                                  Para la precisión del examen, es obligatorio que recolecte su <strong style="font-size: 16px;">PRIMERA ORINA DE LA MAÑANA</strong> ese día.
                                </p>
                                <p style="color: #9d174d; font-size: 14px; line-height: 1.5; margin: 0;">
                                  <strong>Volumen requerido:</strong> Llene el frasco hasta <strong>3/4 de su capacidad</strong>.
                                </p>
                              </td>
                              <td align="center" valign="middle" width="90">
                                <div style="background-color: #ffffff; padding: 10px; border-radius: 12px; border: 1px solid #fbcfe8;">
                                  <img src="https://files.catbox.moe/x4jyi4.png" alt="Frasco 3/4" width="70" style="display: block; max-width: 70px;" />
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #f8fafc; padding: 30px 24px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      Este es un mensaje automático del <strong>Programa piloto de pesquisa de VPH de la Universidad Católica del Norte</strong>.<br>
                      Financiado por el Gobierno Regional de Antofagasta a través del FRPD.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      <em>Si ya han retirado su muestra, por favor ignore este mensaje.</em><br>
                      Por favor, no responda a este correo.
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 11px; color: #cbd5e1;">
                      ID de envío: ${Date.now().toString(36)}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send emails
    const promises = emails.map((email: string) => {
      return transporter.sendMail({
        from: `"Proyecto VPH - UCN" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject || 'Recordatorio Importante - Proyecto VPH',
        html: htmlTemplate,
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, message: `Correos enviados exitosamente a ${emails.length} destinatarios.` });
  } catch (error: any) {
    console.error('Error enviando correos:', error);
    return NextResponse.json({ error: 'Error al enviar los correos', details: error.message }, { status: 500 });
  }
}
