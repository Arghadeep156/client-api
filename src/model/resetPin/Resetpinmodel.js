const hashedPassword = require("../../helpers/bcrypthelper");
const hashPassWord = require("../../helpers/bcrypthelper");
const { ResetpinSchema } = require("./Resetpinschema");
const { generatePin } = require("./../../utils/randomGenerator");

const setPasswordResetPin = async (email) => {
  const restObj = {
    email,
    pin: generatePin(6),
    addedAt: Date.now(),
  };
  try {
    const Resetpin = new ResetpinSchema(restObj);
    const result = await Resetpin.save();
    return result; // Return the saved user
  } catch (error) {
    throw new Error(error.message); // Throw error if something goes wrong
  }
};

const getPinByEmail = async (email) => {
  if (!email) {
    res.json({ status: "error", message: "email is required" });
  }
  try {
    const pinLog = await ResetpinSchema.findOne({ email });
    return pinLog;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`); // Throw more meaningful error
  }
};

const deleteRecordByPin = async (pin) => {
  try {
    const result = await ResetpinSchema.findOneAndDelete({ pin });
    if (!result) {
      console.log("Pin not found");
    }
  } catch (error) {
    console.log("Pin could not be deleted : ", error);
  }
};

module.exports = {
  setPasswordResetPin,
  getPinByEmail,
  deleteRecordByPin,
};
