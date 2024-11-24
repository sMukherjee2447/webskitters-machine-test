import mongoose from "mongoose";

const {Schema, model} = mongoose;

const verificationTokenSchema = new Schema(
  {
    token: {type: String, required: true, unique: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    expiresAt: {type: Date, required: true},
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Verification = model("Verification", verificationTokenSchema);

export default Verification;
