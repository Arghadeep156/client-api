const Joi = require("joi");

const email = Joi.string().email({
  minDomainSegments: 2,
  tlds: { allow: ["com", "net"] },
});

const shortString = Joi.string().min(2).max(50);
const longString = Joi.string().min(2).max(100);
const dt = Joi.date();

const resetPasswordValidation = (req, res, next) => {
  const emailSchema = Joi.object({ email });
  const value = emailSchema.validate(req.body);
  if (value.error) {
    res.json({ status: "error", message: value.error.message });
  }
  next();
};

const updatePasswordValidation = (req, res, next) => {
  const passwordSchema = Joi.object({
    password: Joi.string()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9!@#$%^&*()_+\\-={}|\\[\\]:';,.<>?/~`]{3,30}$"
        )
      )
      .required(),
  });
  const pinSchema = Joi.object({
    pin: Joi.string().min(6).max(6).required(),
  });
  const pinValue = pinSchema.validate({ pin: req.body.pin });
  const passwordValue = passwordSchema.validate({
    password: req.body.password,
  });
  if (pinValue.error || passwordValue.error) {
    return res.json({
      status: "error",
      Pinmessage: pinValue.error.message,
      Passwordmessage: passwordValue.error.message,
    });
  }
  next();
};

const createNewTicketValidation = (req, res, next) => {
  console.log("Create New Tiket Validation Entered");
  const schema = Joi.object({
    subject: shortString.required(),
    sender: shortString.required(),
    message: longString.required(),
    issueDate: dt.required(),
  });

  const validateRequest = schema.validate(req.body);

  if (validateRequest.error) {
    return res.json({
      status: "error",
      message: `createNewTicketValidation - ${validateRequest.error.message}`,
    });
  }
  console.log("Leaving createNewTicketValidation");
  next();
};

const replyTicketMessageValidation = (req, res, next) => {
  const schema = Joi.object({
    sender: shortString.required(),
    message: longString.required(),
  });

  const validateRequest = schema.validate(req.body);

  if (validateRequest.error) {
    return res.json({
      status: "error",
      message: `replyTicketMessageValidation - ${validateRequest.error.message}`,
    });
  }
  next();
};

module.exports = {
  resetPasswordValidation,
  updatePasswordValidation,
  createNewTicketValidation,
  replyTicketMessageValidation,
};
