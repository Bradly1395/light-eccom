"use server";

import { getProduct } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { siteName } from "@/lib/utils";

export type InquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  values?: { name: string; email: string; message: string };
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Strip CR/LF from single-line fields so nothing can sneak into headers.
  const name = String(formData.get("name") ?? "").replace(/[\r\n]+/g, " ").trim();
  const email = String(formData.get("email") ?? "").replace(/[\r\n]+/g, "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const productId = Number(formData.get("productId"));
  const values = { name, email, message };

  // Honeypot: real users never see or fill this field.
  if (String(formData.get("company") ?? "")) return { status: "success" };

  const fieldErrors: InquiryState["fieldErrors"] = {};
  if (name.length < 2 || name.length > 100) fieldErrors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email) || email.length > 254) fieldErrors.email = "Please enter a valid email address.";
  if (message.length < 10) fieldErrors.message = "Tell us a little more (at least 10 characters).";
  if (message.length > 5000) fieldErrors.message = "Please keep your message under 5,000 characters.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values };

  const product = Number.isInteger(productId) ? getProduct(productId) : undefined;
  if (!product) return { status: "error", message: "This product is no longer listed.", values };

  if (!rateLimit(`inquiry:${await clientIp()}`, 5, 10 * 60_000)) {
    return { status: "error", message: "Too many inquiries — please try again in a few minutes.", values };
  }

  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.error("[inquiry] ADMIN_EMAIL is not set");
    return { status: "error", message: "Inquiries are temporarily unavailable. Please try again later.", values };
  }

  const subject = `Inquiry: ${product.title}`;
  const text = [
    `New inquiry from ${siteName()}`,
    ``,
    `Product:  ${product.title} (#${product.id})`,
    `Category: ${product.category}`,
    product.price_text ? `Price:    ${product.price_text}` : null,
    ``,
    `From:     ${name} <${email}>`,
    ``,
    message,
    ``,
    `— Reply to this email to respond directly to ${name}.`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;color:#1f1b17;line-height:1.55">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a7f73;margin:0 0 8px">New product inquiry</p>
    <h2 style="font-size:20px;margin:0 0 4px">${escapeHtml(product.title)}</h2>
    <p style="margin:0 0 20px;color:#6b6157">${escapeHtml(product.category)}${product.price_text ? ` · ${escapeHtml(product.price_text)}` : ""}</p>
    <table style="border-collapse:collapse;margin:0 0 16px;font-size:14px">
      <tr><td style="padding:2px 16px 2px 0;color:#8a7f73">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:2px 16px 2px 0;color:#8a7f73">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    </table>
    <div style="white-space:pre-wrap;background:#f6f2ec;border-radius:10px;padding:16px;font-size:15px">${escapeHtml(message)}</div>
    <p style="font-size:12px;color:#8a7f73;margin-top:20px">Hit “Reply” to respond directly to ${escapeHtml(name)}.</p>
  </div>`;

  try {
    await sendMail({ to, subject, text, html, replyTo: { name, address: email } });
  } catch (err) {
    console.error("[inquiry] failed to send", err);
    return { status: "error", message: "We couldn't send your message right now. Please try again shortly.", values };
  }

  return { status: "success", message: `Thanks, ${name.split(" ")[0]} — we'll reply to ${email} soon.` };
}
