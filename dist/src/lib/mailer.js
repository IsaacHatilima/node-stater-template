import "dotenv/config";
import nodemailer from "nodemailer";
export const mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? "localhost",
    port: Number(process.env.MAIL_PORT) ?? 1025,
    secure: false,
    auth: process.env.MAIL_USERNAME
        ? {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
        : undefined,
});
export async function sendMail(to, subject, html) {
    await mailer.sendMail({
        from: process.env.MAIL_FROM ?? "noreply@example.com",
        to,
        subject,
        html,
    });
}
export function buildEmailTemplate({ name, message, url, buttonText, }) {
    return `
    <div style="
        font-family: Arial, sans-serif;
        background: #f7f7f7;
        padding: 40px 0;
    ">
      <div style="
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #eaeaea;
      ">
        <h2 style="margin-top: 0; font-weight: 600; color: #333;">
          Hello ${name},
        </h2>

        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          ${message}
        </p>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${url}" style="
              background: #2d8cff;
              color: white;
              padding: 12px 22px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              font-size: 15px;
              display: inline-block;
          ">
            ${buttonText}
          </a>
        </div>

        <p style="font-size: 13px; color: #777;">
          If you didn’t request this, you can safely ignore this email.
        </p>

        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 40px;">
          © ${new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </div>
    `;
}
