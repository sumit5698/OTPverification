import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "a1817e001@smtp-brevo.com",
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;


