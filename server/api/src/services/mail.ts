import nodemailer from 'nodemailer';
import config from './env';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.password } : undefined,
});

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  await transporter.sendMail({
    from: config.mail.from,
    to,
    subject: 'Réinitialisation de votre mot de passe - MotsFlex',
    text:
      `Vous avez demandé la réinitialisation de votre mot de passe.\n\n` +
      `Cliquez sur ce lien pour choisir un nouveau mot de passe : ${resetUrl}\n\n` +
      `Ce lien expire dans ${config.resetPassword.tokenExpiresIn} et ne peut être utilisé qu'une seule fois.\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    html:
      `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>` +
      `<p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a></p>` +
      `<p>Ce lien expire dans ${config.resetPassword.tokenExpiresIn} et ne peut être utilisé qu'une seule fois.</p>` +
      `<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  });
};
