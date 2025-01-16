const generatePin = (n) => {
  const min = Math.pow(10, n - 1); // Minimum number with n digits
  const max = Math.pow(10, n) - 1; // Maximum number with n digits
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = { generatePin };
