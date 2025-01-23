const { UserSchema } = require("./Userschema");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const insertUser = async (userObj) => {
  try {
    const user = new UserSchema(userObj);
    const result = await user.save();
    return result; // Return the saved user
  } catch (error) {
    throw new Error("Error creating user: " + error.message); // Throw error if something goes wrong
  }
};

const getUserByEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required"); // More appropriate error handling
  }
  try {
    const user = await UserSchema.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`); // Throw more meaningful error
  }
};

const storeUserRefreshJWT = async (id, token) => {
  try {
    console.log("Is Passed to the storeuserRefreshJWT", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid UserId provided");
      return null;
    }
    const updatedResult = await UserSchema.findOneAndUpdate(
      { _id: id },
      { $set: { "refreshJWT.token": token, "refreshJWT.addedAt": Date.now() } },
      { new: true }
    );
    if (!updatedResult) {
      console.log("User not found");
      return null;
    }
    console.log("inside updated user and request worked");
    return updatedResult;
  } catch (error) {
    console.log("request did not work", error);
  }
};

const getUserById = async (ID) => {
  if (!ID) {
    throw new Error("ID is required"); // More appropriate error handling
  }
  try {
    const user = await UserSchema.findOne({ _id: ID });
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`); // Throw more meaningful error
  }
};

const getUserByRefreshAccessToken = async (key) => {
  if (!key) {
    throw new Error("Refresh JWT token required");
  }
  try {
    const user = await UserSchema.findOne({ "refreshJWT.token": key });
    return user;
  } catch (error) {
    throw new Error(`Error Fetching user:${error}`);
  }
};

const updatePassword = async (email, password) => {
  try {
    const updatedRecord = await UserSchema.findOneAndUpdate(
      { email: email },
      { $set: { password: password } },
      { new: true }
    );

    if (!updatedRecord) {
      console.log("user not found and password not updated");
      return null;
    }
    console.log("request fullfilled");
    return updatedRecord;
  } catch (error) {
    console.log("Process did not work and password not updated", error);
  }
};

module.exports = {
  insertUser,
  getUserByEmail,
  storeUserRefreshJWT,
  getUserById,
  getUserByRefreshAccessToken,
  updatePassword,
};
