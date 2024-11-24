import mongoose from "mongoose";

const {Schema, model} = mongoose;

const questionSchema = new Schema(
  {
    questionText: {type: String, required: true, trim: true},
    options: {type: [String], required: true},
    correctAnswer: {type: String, required: true},
    categories: [{type: mongoose.Types.ObjectId, ref: "Category"}],
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Question = model("Question", questionSchema);

export default Question;
