import nodemailer from "nodemailer";

export var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "09194513596836",
    pass: "71a8b453c91f4e",
  },
});
