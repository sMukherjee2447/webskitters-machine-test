import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import HttpStatus from "http-status";

dotenv.config();

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      STATUSCODE: HttpStatus.UNAUTHORIZED,
      message: "Access denied, no token provided",
      data: {},
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      STATUSCODE: HttpStatus.UNAUTHORIZED,
      message: "Invalid or expired token",
      response_data: {},
    });
    return; // Exit the function after sending the response
  }
};

export default auth;
