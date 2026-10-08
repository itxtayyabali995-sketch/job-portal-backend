import { Application as application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";


export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false
            });
        }

        // Check if user already applied
        const existingApplication = await application.findOne({
            job: jobId,
            applicant: userId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You already applied for this job",
                success: false
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Create application
        const newApplication = await application.create({
            job: jobId,
            applicant: userId
        });

        // Add application to job
        job.applications.push(newApplication._id);

        await job.save();

        return res.status(201).json({
            message: "Job applied successfully",
            success: true
        });

    } catch (error) {
        console.log("Apply Job Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;

        const appliedJobs = await application
            .find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                populate: {
                    path: "company"
                }
            });

        if (!appliedJobs || appliedJobs.length === 0) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            });
        }

        return res.status(200).json({
            appliedJobs,
            success: true
        });

    } catch (error) {
        console.log("Get Applied Jobs Error:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false
            });
        }

        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: {
                sort: {
                    createdAt: -1
                }
            },
            populate: {
                path: "applicant",
                select: "fullname email phoneNumber profile createdAt"
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        console.log("JOB ID:", jobId);
        console.log("APPLICATIONS:", job.applications);
        console.log("APPLICATION COUNT:", job.applications.length);

        return res.status(200).json({
            applications: job.applications,
            success: true
        });

    } catch (error) {
        console.log("Get Applicants Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const UpdateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false
            });
        }

        const singleApplication = await application.findById(applicationId);

        if (!singleApplication) {
            return res.status(404).json({
                message: "Application not found!",
                success: false
            });
        }

        singleApplication.status = status.toLowerCase();

        await singleApplication.save();

        return res.status(200).json({
            message: "Status updated successfully",
            success: true
        });

    } catch (error) {
        console.log("Update Status Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};