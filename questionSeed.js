import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./src/models/Questions.js";
import Category from "./src/models/Categories.js";

dotenv.config();

// Seed data
const questionData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connected!");

    // Fetch categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.error("No categories found. Please seed categories first.");
      process.exit(1);
    }

    // Define question data
    const questions = [
      {
        questionText: "What is the capital of Italy?",
        options: ["Rome", "Paris", "Berlin", "Madrid"],
        correctAnswer: "Rome",
        categories: [categories[0]._id, categories[1]._id], // Assigned to multiple categories
      },
      {
        questionText: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Jupiter",
        categories: [categories[1]._id], // Assigned to a single category
      },
      {
        questionText: "What is H2O commonly known as?",
        options: ["Oxygen", "Water", "Hydrogen", "Salt"],
        correctAnswer: "Water",
        categories: [categories[0]._id, categories[2]._id], // Assigned to multiple categories
      },
      {
        questionText: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Leo Tolstoy",
          "Mark Twain",
        ],
        correctAnswer: "William Shakespeare",
        categories: [categories[2]._id], // Assigned to a single category
      },
      {
        questionText: "What is 15 x 5?",
        options: ["70", "75", "80", "85"],
        correctAnswer: "75",
        categories: [categories[3]._id], // Math category
      },
      {
        questionText: "What is the speed of light?",
        options: [
          "300,000 km/s",
          "150,000 km/s",
          "200,000 km/s",
          "250,000 km/s",
        ],
        correctAnswer: "300,000 km/s",
        categories: [categories[1]._id, categories[3]._id], // Assigned to multiple categories
      },
      {
        questionText: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8",
        categories: [categories[3]._id], // Assigned to Math category
      },
      {
        questionText: "What is the boiling point of water?",
        options: ["90°C", "100°C", "110°C", "120°C"],
        correctAnswer: "100°C",
        categories: [categories[0]._id], // Assigned to first category
      },
    ];

    // Insert questions
    await Question.insertMany(questions);

    console.log("Questions seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding questions:", error.message);
    process.exit(1);
  }
};

questionData();
