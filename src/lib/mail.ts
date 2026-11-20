import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/* ────────────────────────────────────────────────────────────────
 * Nodemailer over plain SMTP — works with any provider (Gmail app
 * passwords, Fastmail, Postfix on localhost, Mailpit for testing…).
 * ──────────────────────────────────────────────────────────────── */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export type OutgoingMail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: { name: string; address: string };
};

export async function sendMail(mail: OutgoingMail) {
  const t = getTransporter();

  if (!t) {
    if (process.env.NODE_ENV !== "production") {
      // Dev convenience: no SMTP configured → print the email instead of failing.
      console.info(
        `\n[mail:dev] SMTP_HOST not set — email not sent.\n  To: ${mail.to}\n  Reply-To: ${mail.replyTo.name} <${mail.replyTo.address}>\n  Subject: ${mail.subject}\n\n${mail.text}\n`,
      );
      return;
    }
    throw new Error("SMTP is not configured (SMTP_HOST is missing).");
  }

  const siteName = process.env.SITE_NAME || "Catalog";
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || mail.to;

  await t.sendMail({
    from: fromAddress.includes("<") ? fromAddress : { name: siteName, address: fromAddress },
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
