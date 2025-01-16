const express = require("express");
const router = express.Router();
const { verifyRefreshJWT, createAccessJWT } = require("../helpers/jwtHelper");
const { getUserByRefreshAccessToken } = require("./../model/user/Usermodel");

router.get("/fresh-access-jwt", async (req, res, next) => {
  //todo
  //1. make sure the token is valid
  const { authorization } = req.headers;
  const decode = await verifyRefreshJWT(authorization);

  if (decode.email) {
    //2. check if the jwt exist in mongoDB database.
    const user = await getUserByRefreshAccessToken(authorization);
    if (user._id) {
      let tokenExp = user.refreshJWT.addedAt;
      tokenExp = tokenExp.setDate(
        tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
      );
      //3. check if it is not expired
      const today = new Date();
      if (user.refreshJWT.token !== authorization && tokenExp < today) {
        res.status(403).json({ message: "Expired RefreshJWT token" });
      }
      const accessJWT = await createAccessJWT(user.email, user._id);
      res.json({ status: "success", accessJWT });
    }
  } else {
    res.status(403).json({ message: "Could not verify refresh token" });
  }
});

module.exports = router;
