import HttpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import moment from "moment-timezone";

import User from "../models/Users.js";
import Verification from "../models/verificationToken.js";
import Categories from "../models/Categories.js";
import Questions from "../models/Questions.js";
import Answer from "../models/Answer.js";

import registrationEmailTemplate from "../utils/registration-email-template.js";
import accountVerifiedTemplate from "../utils/account-verified-template.js";
import {STATUS_CODES} from "http";

dotenv.config();

const registerUser = async (request, file) => {
  try {
    const existingUser = await User.findOne({email: request.email});
    if (existingUser) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_GATEWAY,
        message: "User already exists",
        response_data: {},
      };
    }

    if (request.password !== request.confirm_password) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "Password and confirm password does not match",
        data: {},
      };
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const photoUrl = file ? `src/uploads/${file.filename}` : null;

    const new_user = await User.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      profilePicture: photoUrl,
    });

    // Generate a short token
    const token = crypto.randomBytes(16).toString("hex");

    const new_token = await Verification.create({
      token: token,
      userId: new_user._id,
      expiresAt: Date.now() + 3600000, // 1 hour from now
    });

    let htmlContent = registrationEmailTemplate.replace(
      "[verification_token]",
      token
    );
    // Send verification email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.TRANSPORTER_MAIL,
        pass: process.env.TRANSPORTER_PASS,
      },
    });
    const mailOptions = {
      to: request.email,
      subject: "Verify Your Email",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "Signup successful! Please check your email for verification.",
      data: new_user,
    };
  } catch (err) {
    console.error("Error creating new user :", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An Unexpected Error Occured",
      data: {},
    };
  }
};

const verifyUser = async (request) => {
  try {
    // Find the short token in the database
    const verificationRecord = await Verification.findOne({
      token: request.token,
    });
    if (!verificationRecord)
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_GATEWAY,
        message: "Invalid or expired verification token.",
        data: {},
      };

    // Check if the token has expired
    if (verificationRecord.expiresAt < Date.now()) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_GATEWAY,
        message: "Verification token has expired.",
        data: {},
      };
    }

    // Mark user as verified
    const user = await User.findById(verificationRecord.userId);
    if (!user) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_GATEWAY,
        message: "User not found",
        data: {},
      };
    }

    user.isVerified = true;
    await user.save();

    return accountVerifiedTemplate;
  } catch (err) {
    console.error("Err : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_GATEWAY,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const signInUser = async (request) => {
  try {
    // Check if the user exists
    const user = await User.findOne({email: request.email});
    if (!user) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "User not found",
        response_data: {},
      };
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(request.password, user.password);
    if (!isMatch) {
      return {
        success: false,
        STATUSCODE: HttpStatus.NOT_ACCEPTABLE,
        message: "Invalid email or password",
        response_data: {},
      };
    }

    // Generate JWT
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.profilePicture = `http://localhost:5000/${user.profilePicture.replace(
      "src/",
      ""
    )}`;

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "User logged in successfully",
      response_data: user,
      token,
    };
  } catch (err) {
    console.error("Error signing in user : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const getProfile = async (request) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(request.userId)) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "Invalid user Id format",
        data: {},
      };
    }

    const User_details = await User.findById(request.userId);

    User_details.profilePicture = `http://localhost:5000/${User_details.profilePicture.replace(
      "src/",
      ""
    )}`;

    if (!User_details) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "User Not Found",
        data: {},
      };
    }

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "User Fetched Successfully",
      data: User_details,
    };
  } catch (err) {
    console.error("Error fetching profile : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const updateUser = async (request, file) => {
  try {
    const checkUser = await User.findById(request.userId);
    if (!checkUser) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "User not found",
        data: {},
      };
    }

    // handle profile picture upload
    let photoUrl = checkUser.profilePicture;
    if (file) {
      if (checkUser.profilePicture) {
        const oldImagePath = path.join("", checkUser.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      photoUrl = `src/uploads/${file.filename}`;
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      {
        name: request.name || checkUser.name,
        email: request.email || checkUser.email,
        profilePicture: photoUrl,
      },
      {
        new: true,
      }
    );

    updatedUser.profilePicture = `http://localhost:5000/${updatedUser.profilePicture.replace(
      "src/",
      ""
    )}`;

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (err) {
    console.error("Error updating user : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const getAllCategories = async () => {
  try {
    const all_categories = await Categories.find();

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "List of all categories",
      data: all_categories,
    };
  } catch (err) {
    console.error("Error fetching categories : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const getAllQuestions = async () => {
  try {
    const questions_by_category = await Categories.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "categories",
          as: "questions",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          questions: {
            _id: 1,
            questionText: 1,
            options: 1,
            correctAnswer: 1,
          },
        },
      },
    ]);

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "Category wise questions",
      data: questions_by_category,
    };
  } catch (err) {
    console.error("Error fetching questions : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const bulkUploadQuestions = async (request, file) => {
  try {
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const questions = [];
    const promises = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        let categoryArr = [];
        const categories = row.categories.split(";").map((id) => id.trim());

        const categoryLookupPromise = Categories.find({
          name: {$in: categories.map((cat) => new RegExp(`^${cat}$`, "i"))},
        }).then((categoryList) => {
          for (let cat of categoryList) {
            categoryArr.push(cat._id);
          }

          const options = row.options.split(";").map((opt) => opt.trim());
          questions.push({
            questionText: row.questionText,
            options,
            correctAnswer: row.correctAnswer.trim(),
            categories: categoryArr,
          });
        });

        promises.push(categoryLookupPromise);
      })
      .on("end", async () => {
        await Promise.all(promises);
        await Questions.insertMany(questions);
      });

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "Questions uploaded successfully",
      data: {},
    };
  } catch (err) {
    console.error("Error uploading questions : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "An unexpected error occured",
      data: {},
    };
  }
};

const submitAnswer = async (request) => {
  try {
    const {userId, questionId, selectedAnswer} = request;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "User not found",
        data: {},
      };
    }

    // Find the question
    const question = await Questions.findById(questionId);
    if (!question) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "Question not found",
        data: {},
      };
    }

    // Check if the answer is correct
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Check if the user has already answered this question
    const existingAnswer = await Answer.findOne({
      user: userId,
      question: questionId,
    });

    if (existingAnswer) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "You have already answered this question",
        data: {},
      };
    }

    // Save the answer to the database
    const newAnswer = await Answer.create({
      user: userId,
      question: questionId,
      selectedAnswer,
      isCorrect,
    });

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "Answer submitted successfully",
      data: newAnswer,
    };
  } catch (err) {
    console.error("Error submitting answer : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "Error submitting answer",
      data: {},
    };
  }
};

const searchByQuestion = async (request) => {
  try {
    const {questionText, userId, timezone} = request;

    // Validate input
    if (!questionText || !userId || !timezone) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "Question text, userId, and timezone are required.",
        data: {},
      };
    }

    const question = await Questions.findOne({
      questionText: {$regex: new RegExp(questionText, "i")},
    });

    console.log({question});

    if (!question) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "Question not found.",
        data: {},
      };
    }

    // Find the answer submitted by the user for this question
    const answer = await Answer.findOne({
      user: userId,
      question: question._id,
    }).populate("question");

    if (!answer) {
      return {
        success: false,
        STATUSCODE: HttpStatus.BAD_REQUEST,
        message: "No Answer Found",
        data: {},
      };
    }

    // Convert the submission time to the user's timezone
    const submissionTime = moment(answer.submittedAt)
      .tz(timezone)
      .format("YYYY-MM-DD HH:mm:ss");

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "Question found successfully.",
      data: {
        question: question.questionText,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        submittedAt: submissionTime,
      },
    };
  } catch (err) {
    console.error("Error searching for questions :", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "Error searching for questions",
      data: {},
    };
  }
};

const listAllCategory = async () => {
  try {
    const result = await Categories.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "categories",
          as: "questions",
        },
      },
      {
        $addFields: {
          questionCount: {$size: "$questions"},
        },
      },
      {
        $project: {
          questions: 0,
        },
      },
    ]);

    return {
      success: true,
      STATUSCODE: HttpStatus.OK,
      message: "List of all categories",
      data: result,
    };
  } catch (err) {
    console.error("An unexpected error occured : ", err.message);
    return {
      success: false,
      STATUSCODE: HttpStatus.BAD_REQUEST,
      message: "Error fetching categories",
      data: {},
    };
  }
};

export default {
  registerUser,
  verifyUser,
  signInUser,
  getProfile,
  updateUser,
  getAllCategories,
  getAllQuestions,
  bulkUploadQuestions,
  submitAnswer,
  searchByQuestion,
  listAllCategory,
};
