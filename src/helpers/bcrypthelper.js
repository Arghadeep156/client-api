const bcrypt = require("bcryptjs");
const saltRounds = 10;

const hashPassWord = async (password) => {
  const salt = await bcrypt.genSalt(10); // Salt is generated correctly
  return await bcrypt.hash(password, salt);
  // return new Promise((resolve) => {
  //   resolve(bcrypt.hashSync(password, saltRounds));
  // });
};

const comparePassword = (password, hashedPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = { hashPassWord, comparePassword };
