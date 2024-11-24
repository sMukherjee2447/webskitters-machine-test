import {sign} from "crypto";
import userService from "../services/api.service.js";

const registerUser = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "Please provide valid name",
      data: {},
    });
  }

  if (!req.body.email) {
    return res.status(400).send({
      message: "Please provide valid email",
      data: {},
    });
  }

  const registered_user = await userService.registerUser(req.body, req.file);

  res.status(200).send(registered_user);
};

const verifyToken = async (req, res) => {
  if (!req.params.token) {
    return res.status(400).send({
      message: "User did not verified",
      data: {},
    });
  }

  const verified_user = await userService.verifyUser(req.params);
  res.status(200).send(verified_user);
};

const userSignin = async (req, res) => {
  const signin_user = await userService.signInUser(req.body);

  res.status(200).send(signin_user);
};

const getProfile = async (req, res) => {
  const get_user_profile = await userService.getProfile(req.query);

  res.status(200).send(get_user_profile);
};

const updateUser = async (req, res) => {
  const update_user = await userService.updateUser(req.body, req.file);

  res.status(200).send(update_user);
};

const getAllCategories = async (req, res) => {
  const get_all_categories = await userService.getAllCategories();

  res.status(200).send(get_all_categories);
};

const listAllQuestions = async (req, res) => {
  const get_all_questions = await userService.getAllQuestions();

  res.status(200).send(get_all_questions);
};

const bulkUploadQuestions = async (req, res) => {
  const bulk_upload_question = await userService.bulkUploadQuestions(
    req.body,
    req.file
  );

  res.status(200).send(bulk_upload_question);
};

const submitAnswer = async (req, res) => {
  const submit_answer = await userService.submitAnswer(req.body);

  res.status(200).send(submit_answer);
};

const searchByQuestion = async (req, res) => {
  const search_by_question = await userService.searchByQuestion(req.body);
  res.status(200).send(search_by_question);
};

const listAllCategory = async (req, res) => {
  const list_all_category = await userService.listAllCategory();
  res.status(200).send(list_all_category);
};

export default {
  registerUser,
  verifyToken,
  userSignin,
  getProfile,
  updateUser,
  getAllCategories,
  listAllQuestions,
  bulkUploadQuestions,
  submitAnswer,
  searchByQuestion,
  listAllCategory,
};
