const { verifyAccessJWT } = require("./../helpers/jwtHelper");
const { getJWT, deleteJWT } = require("./../helpers/redishelper");

const userAuthorization = async (req, res, next) => {
  const { authorization } = req.headers;

  // Verify if JWT is valid
  const decodeLog = await verifyAccessJWT(authorization);
  // Verify if JWT exists in redis and extract user ID

  if (decodeLog.email) {
    const result = await getJWT(authorization);
    if (!result) {
      res.status(403).json({ message: "JWT token not present in redis" });
    }
    console.log("Before");
    console.log("AuthorizationMiddleware", result);
    req.body.userID = result;
    console.log("After");
    next();
  } else {
    deleteJWT(authorization);
    res.status(403).json({ message: "JWT token not present in redis" });
  }
};

module.exports = userAuthorization;
