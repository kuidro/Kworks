import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error al enviar email:", error)
  }
}

export function templateEtapaActivada(
  evaluadorNombre: string,
  candidatoNombre: string,
  etapaUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1e3a5f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #c9a84c; font-size: 14px; }
        .body { padding: 30px; }
        .body h2 { color: #1e3a5f; margin-top: 0; }
        .btn { display: inline-block; background-color: #c9a84c; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Montblanc Consulting</h1>
          <p>Sistema de Evaluación de Candidatos</p>
        </div>
        <div class="body">
          <h2>Nueva Evaluación Asignada</h2>
          <p>Estimado/a <strong>${evaluadorNombre}</strong>,</p>
          <p>Le informamos que tiene una nueva etapa de evaluación lista para realizar.</p>
          <p>Candidato: <strong>${candidatoNombre}</strong></p>
          <p>Por favor, acceda al sistema para completar la evaluación:</p>
          <a href="${etapaUrl}" class="btn">Ir a la Evaluación</a>
          <p>Si no puede hacer clic en el botón, copie y pegue el siguiente enlace en su navegador:</p>
          <p style="word-break: break-all; font-size: 13px; color: #666;">${etapaUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Montblanc Consulting. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateCandidatoAvanza(
  evaluadorNombre: string,
  candidatoNombre: string,
  etapaUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1e3a5f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #c9a84c; font-size: 14px; }
        .body { padding: 30px; }
        .body h2 { color: #1e3a5f; margin-top: 0; }
        .btn { display: inline-block; background-color: #c9a84c; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Montblanc Consulting</h1>
          <p>Sistema de Evaluación de Candidatos</p>
        </div>
        <div class="body">
          <h2>Candidato Avanza a su Etapa</h2>
          <p>Estimado/a <strong>${evaluadorNombre}</strong>,</p>
          <p>El candidato <strong>${candidatoNombre}</strong> ha avanzado satisfactoriamente la etapa anterior y ahora le corresponde a usted realizar la siguiente evaluación.</p>
          <p>Por favor, acceda al sistema para completar la evaluación:</p>
          <a href="${etapaUrl}" class="btn">Ir a la Evaluación</a>
          <p>Si no puede hacer clic en el botón, copie y pegue el siguiente enlace en su navegador:</p>
          <p style="word-break: break-all; font-size: 13px; color: #666;">${etapaUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Montblanc Consulting. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateProcesoTerminado(candidatoNombre: string, cargo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1e3a5f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #c9a84c; font-size: 14px; }
        .body { padding: 30px; }
        .body h2 { color: #1e3a5f; margin-top: 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Montblanc Consulting</h1>
          <p>Sistema de Evaluación de Candidatos</p>
        </div>
        <div class="body">
          <h2>Información sobre su Postulación</h2>
          <p>Estimado/a <strong>${candidatoNombre}</strong>,</p>
          <p>Le agradecemos el tiempo y el interés demostrado en el proceso de postulación para el cargo de <strong>${cargo}</strong>.</p>
          <p>Luego de una cuidadosa evaluación, lamentamos informarle que en esta oportunidad hemos decidido continuar el proceso con otros candidatos cuyo perfil se ajusta mejor a los requerimientos específicos del cargo.</p>
          <p>Su currículum quedará en nuestros registros para futuras oportunidades que puedan surgir.</p>
          <p>Le deseamos mucho éxito en su búsqueda laboral.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Montblanc Consulting. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateProcesoCompletado(candidatoNombre: string, cargo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1e3a5f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #c9a84c; font-size: 14px; }
        .body { padding: 30px; }
        .body h2 { color: #1e3a5f; margin-top: 0; }
        .highlight { background-color: #f0f7e6; border-left: 4px solid #4caf50; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Montblanc Consulting</h1>
          <p>Sistema de Evaluación de Candidatos</p>
        </div>
        <div class="body">
          <h2>¡Felicitaciones!</h2>
          <p>Estimado/a <strong>${candidatoNombre}</strong>,</p>
          <div class="highlight">
            <p style="margin:0; font-weight: bold;">Ha completado exitosamente el proceso de evaluación para el cargo de ${cargo}.</p>
          </div>
          <p>Es un placer informarle que ha superado todas las etapas de evaluación satisfactoriamente. Nuestro equipo se pondrá en contacto con usted a la brevedad para coordinar los próximos pasos.</p>
          <p>¡Le damos la bienvenida y esperamos contar con usted en nuestro equipo!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Montblanc Consulting. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function templateAdminRechazo(candidatoNombre: string, evaluadorNombre: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1e3a5f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #c9a84c; font-size: 14px; }
        .body { padding: 30px; }
        .body h2 { color: #1e3a5f; margin-top: 0; }
        .alert { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Montblanc Consulting</h1>
          <p>Sistema de Evaluación de Candidatos</p>
        </div>
        <div class="body">
          <h2>Proceso de Evaluación Terminado</h2>
          <p>Estimado Administrador,</p>
          <div class="alert">
            <p style="margin:0;"><strong>Notificación:</strong> El evaluador <strong>${evaluadorNombre}</strong> ha decidido terminar el proceso de evaluación del candidato <strong>${candidatoNombre}</strong>.</p>
          </div>
          <p>El proceso ha sido marcado como TERMINADO en el sistema. El candidato ha sido notificado automáticamente.</p>
          <p>Por favor, acceda al sistema para revisar los detalles y tomar las acciones necesarias.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Montblanc Consulting. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
