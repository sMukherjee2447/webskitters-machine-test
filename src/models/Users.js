import mongoose from "mongoose";

const {Schema, model} = mongoose;

const userSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {type: String, required: true},
    profilePicture: {type: String, default: ""},
    isVerified: {type: Boolean, default: false},
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;
