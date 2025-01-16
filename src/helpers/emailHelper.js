const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "jamal23@ethereal.email",
    pass: "Kqym7Uy61jVydXAwvN",
  },
});

const send = async (info) => {
  try {
    const sender = await transporter.sendMail(info);
    console.log("Message sent: %s", sender.messageId);
    console.log("Preview URL : %s", nodemailer.getTestMessageUrl(sender));
    return sender;
  } catch (error) {
    console.log(error.message);
  }
};

const emailProcessor = async (email, pin) => {
  const info = {
    from: `CRM Company <jamal23@ethereal.email>`,
    to: email,
    subject: "Password Reset Pin",
    text: `Here is your password reset PIN ${pin}. This pin will expire in 1 day`,
    html: `<p>Here is your password reset PIN <b>${pin}</b>. This pin will expire in 1 day</p>`,
  };
  const value = await send(info);
  return value;
};

const emailProcessPassword = async (email, password) => {
  //We can also take a object as an argument and destructure it in here itself.
  const info = {
    from: `CRM Company <jamal23@ethereal.email>`,
    to: email,
    subject: "New password ready to use",
    text: `New password has been updated`,
    html: `<p>New password has been updated</p>`,
  };
  const value = await send(info);
  return value;
};

module.exports = { emailProcessor, emailProcessPassword };
