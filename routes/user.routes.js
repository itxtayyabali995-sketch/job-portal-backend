import express from "express"
import { register, login, updateProfile, logout } from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/isAuthenticted.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();
router.route("/register").post(singleUpload, register)
router.route("/login").post(login)
router.route("/logout").get(logout)

router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile)

export default router;