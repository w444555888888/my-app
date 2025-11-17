import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, // Gmail 應用程式密碼
  },
});


export const sendMail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html,
  });
};
