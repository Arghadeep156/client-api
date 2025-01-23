const express = require("express");
const { route } = require("./ticketRouter");
const router = express.Router();
const {
  insertUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  storeUserRefreshJWT,
} = require("../model/user/Usermodel");
const { hashPassWord, comparePassword } = require("../helpers/bcrypthelper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwtHelper");
const { setJWT, getJWT } = require("../helpers/redishelper");
const userAuthorization = require("./../middlewares/authorizationMiddleware");
const { crossOriginResourcePolicy } = require("helmet");
const {
  setPasswordResetPin,
  getPinByEmail,
  deleteRecordByPin,
} = require("./../model/resetPin/Resetpinmodel");
const {
  emailProcessor,
  emailProcessPassword,
} = require("../helpers/emailHelper");
const {
  resetPasswordValidation,
  updatePasswordValidation,
} = require("../middlewares/formValidationMiddleware");
const { verify } = require("jsonwebtoken");
const { deleteJWT } = require("./../helpers/redishelper");

// Get user profile data
router.get("/", userAuthorization, async (req, res) => {
  // Get user profile based on user id
  const { userID } = req.body;
  const result = await getUserById(userID);

  if (!result) {
    return res.json({
      status: "error",
      message: "User could not be retrieved",
    });
  }
  return res.json({
    status: "success",
    message: { result },
  });
});

//Create New User Route
router.post("/", async (req, res) => {
  try {
    const { password } = req.body;
    let updatedUser = {
      ...req.body,
      password: await hashPassWord(password),
      refreshJWT: { token: null, addedAt: Date.now() },
    };
    const result = await insertUser(updatedUser); // Wait for the user to be inserted
    res.status(201).json({ message: "New user created", result });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

//Create User Signin Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: "error", message: "Invalid Request" });
  }

  //Get user with email from DB
  const user = await getUserByEmail(email);

  if (!user) {
    return res.json({ status: "error", message: "User not found" });
  }

  const passwordFromDB = user._id ? user.password : null;

  let result = await comparePassword(password, passwordFromDB);

  if (!result) {
    return res.json({ status: "error", message: "Invalid Email or Password" });
  }
  const accessJWT = await createAccessJWT(user.email, user._id);
  const refreshJWT = await createRefreshJWT(user.email, user._id);

  return res.json({
    status: "success",
    message: "User logged in",
    accessJWT,
    refreshJWT,
  });
});

//New PIN generation request for password reset
router.post("/reset-password", resetPasswordValidation, async (req, res) => {
  const { email } = req.body;
  //Checking if the user exists for the email
  const userProfile = await getUserByEmail(email);
  if (userProfile && userProfile._id) {
    const data = await setPasswordResetPin(email);
    const result = await emailProcessor(email, data.pin);
    if (result && result.messageId) {
      return res.json({
        status: "success",
        message: "Mail Sent",
      });
    } else {
      return res.json({
        status: "success",
        message:
          "Unable to process your request at this moment please try again later",
      });
    }
  }
  res.status(403).json({ message: { data } });
});

//New password provided by user along with the pin
router.patch("/reset-password", updatePasswordValidation, async (req, res) => {
  const { email, pin, password } = req.body;
  if (!password) {
    console.log("Password is missing");
  }
  const newHashedPassword = await hashPassWord(password);
  const pinLog = await getPinByEmail(email);
  if (pinLog && pinLog.email === email && pinLog.pin === pin) {
    let pinExpiry = pinLog.addedAt;
    pinExpiry = pinExpiry.setDate(
      pinExpiry.getDate() + +process.env.PIN_EXPIRY
    );
    console.log("Pin Expiry Time:", new Date(pinExpiry));
    console.log("Current Time:", new Date(Date.now()));

    if (pinExpiry > Date.now()) {
      const result = await updatePassword(email, newHashedPassword);
      if (!result) {
        res.status(402).json({ message: "User password not updated" });
      }
      const emailStatus = await emailProcessPassword(email, password);
      if (emailStatus && emailStatus.messageId) {
        await deleteRecordByPin(pin);
        return res.json({
          status: "success",
          message: "Password mail Sent",
        });
      } else {
        return res.json({
          status: "success",
          message:
            "Password - Unable to process your request at this moment please try again later",
        });
      }
    } else {
      res.status();
    }
  } else {
    return res
      .status(402)
      .json({ message: "Incorrect Pin. Click here to resend Pin" });
  }
});

//Logout User
router.delete("/logout", userAuthorization, async (req, res) => {
  //Get jwt and verify
  const { authorization } = req.headers;
  const { userID } = req.body;
  console.log("User Router for logout route", userID);
  //Delete accessJWT from redis database
  await deleteJWT(authorization);
  //Deleting the refreshJWT from the mongoDB.
  const result = await storeUserRefreshJWT(userID, "");
  if (result) {
    if (result._id) {
      return res.json({
        status: "success",
        message: "Logged out successfully",
      });
    }
  } else {
    return res.json({
      status: "error",
      status: "storeUserRefreshJWT is not working properly",
    });
  }
  res.json({ status: "error", status: "Could not log out, log out later" });
});

module.exports = router;
