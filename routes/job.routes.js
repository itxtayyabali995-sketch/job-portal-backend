import express from "express"
import isAuthenticated from "../middlewares/isAuthenticted.js";
import { deleteJob, getAdminJobs, getAllJobs, getJobById, PostJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, PostJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getAdminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);


export default router;