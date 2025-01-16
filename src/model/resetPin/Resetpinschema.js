const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetpinSchema = new Schema({
  email: { type: String, maxlength: 50, required: true },
  pin: { type: String, maxLength: 6, minlength: 6 },
  addedAt: { type: Date, required: true },
});

module.exports = {
  ResetpinSchema: mongoose.model("Reset_pin", ResetpinSchema),
};
