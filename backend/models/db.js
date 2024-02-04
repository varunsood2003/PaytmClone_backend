const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "userData",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model("UserData", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = { userModel, Account };
