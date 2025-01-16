const jwt = require("jsonwebtoken");
const { setJWT } = require("../helpers/redishelper");
const { storeUserRefreshJWT } = require("../model/user/Usermodel");

const createAccessJWT = async (email, id) => {
  const accessJWT = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  await setJWT(accessJWT, id.toString());
  return Promise.resolve(accessJWT);
};

const createRefreshJWT = (email, id) => {
  const refreshJWT = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  console.log(refreshJWT);
  storeUserRefreshJWT(id.toString(), refreshJWT);
  return Promise.resolve(refreshJWT);
};

const verifyAccessJWT = (userAccessJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(userAccessJWT, process.env.JWT_ACCESS_SECRET)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};

const verifyRefreshJWT = (userRefreshJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(userRefreshJWT, process.env.JWT_REFRESH_SECRET)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};

module.exports = {
  createAccessJWT,
  createRefreshJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
};
