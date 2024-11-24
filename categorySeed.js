import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Categories.js";

dotenv.config();

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI; // Replace with your DB name

// List of categories to seed
const categories = [
  {name: "Science", description: "Questions related to science topics."},
  {name: "Math", description: "Questions related to mathematics."},
  {
    name: "History",
    description: "Questions related to historical events and figures.",
  },
  {name: "Geography", description: "Questions related to world geography."},
  {
    name: "Technology",
    description: "Questions about technology and innovations.",
  },
  {name: "Sports", description: "Questions about sports and games."},
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing categories (optional)
    await Category.deleteMany();
    console.log("Existing categories removed.");

    // Insert new categories
    await Category.insertMany(categories);
    console.log("Categories seeded successfully!");

    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedCategories();
