import express from "express";
import userController from "../controllers/api.controller.js";
import upload from "../middlewares/image-upload.js";
import csv_upload from "../middlewares/csv-upload.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/user-signup")
  .post(upload.single("photo"), userController.registerUser);

router.route("/verify-token/:token").get(userController.verifyToken);

router.route("/user-signin").post(userController.userSignin);

router.route("/user-profile").get(auth, userController.getProfile);

router
  .route("/edit-user")
  .patch(auth, upload.single("photo"), userController.updateUser);

router
  .route("/category/get-all-categories")
  .get(auth, userController.getAllCategories);

router
  .route("/category/list-all-question")
  .get(auth, userController.listAllQuestions);

router
  .route("/questions/bulk-upload-questions")
  .post(auth, csv_upload.single("file"), userController.bulkUploadQuestions);

router.route("/submit-answer").post(auth, userController.submitAnswer);

router.route("/search_by_question").post(auth, userController.searchByQuestion);

router
  .route("/category/list-all-category")
  .get(auth, userController.listAllCategory);

export default router;
