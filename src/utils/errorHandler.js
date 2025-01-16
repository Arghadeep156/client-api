// All the error genenrated will pass through this function and we can either choose to log it or we can make database actions.
const handleError = (error, res) => {
  console.log(error);
  res.status(error.status || 500);
  res.json({ message: error.message });
};

module.exports = handleError;
