import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";

export const PostJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            sellory,
            location,
            jobtype,
            experience,
            position,
            companyId
        } = req.body;

        const userId = req.id;

        if (
            !title ||
            !description ||
            !requirements ||
            !sellory ||
            !location ||
            !jobtype ||
            !experience ||
            !companyId
        ) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        // Check whether selected company exists
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Selected company not found",
                success: false
            });
        }

        const newJob = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            sellory: Number(sellory),
            location,
            jobType: jobtype,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        const populatedJob = await Job.findById(newJob._id)
            .populate({
                path: "company"
            });

        return res.status(201).json({
            message: "New job created successfully",
            job: populatedJob,
            success: true
        });

    } catch (error) {
        console.log("Post Job Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const getAllJobs = async (req, res) => {
    try {
        const Keyword = req.query.Keyword || "";

        const query = {
            $or: [
                {
                    title: {
                        $regex: Keyword,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: Keyword,
                        $options: "i"
                    }
                }
            ]
        };

        const jobs = await Job.find(query)
            .populate({
                path: "company"
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log("Get All Jobs Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const singlejob = await Job.findById(jobId)
            .populate({
                path: "company"
            })
            .populate({
                path: "applications"
            });

        if (!singlejob) {
            return res.status(404).json({
                message: "Job is not found!",
                success: false
            });
        }

        return res.status(200).json({
            job: singlejob,
            success: true
        });

    } catch (error) {
        console.log("Get Job By ID Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({
            created_by: new mongoose.Types.ObjectId(adminId)
        })
            .populate({
                path: "company"
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log("Get Admin Jobs Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



export const updateJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            sellory,
            location,
            jobtype,
            experience,
            position,
            companyId
        } = req.body;

        const jobId = req.params.id;
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Selected company not found",
                success: false
            });
        }

        const updateData = {
            title,
            description,
            requirements:
                typeof requirements === "string"
                    ? requirements.split(",")
                    : requirements,
            sellory: Number(sellory),
            location,
            jobType: jobtype,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId
        };

        const job = await Job.findByIdAndUpdate(
            jobId,
            updateData,
            { new: true }
        ).populate("company");

        if (!job) {
            return res.status(404).json({
                message: "Job not found!",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.log("Update Job Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job deleted successfully",
            success: true
        });

    } catch (error) {
        console.log("Delete Job Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};