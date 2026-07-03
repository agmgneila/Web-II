import nodemailer from 'nodemailer';

export const sendVerification = async (email, code) => {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === 'test') return;
    throw new Error('Falta configuración SMTP');
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Código de verificación de BildyApp',
    text: `Tu código de verificación es ${code}`
  });
};
