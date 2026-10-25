import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";


export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required",
                success: false
            });
        }

        let company = await Company.findOne({
            name: companyName
        });

        if (company) {
            return res.status(400).json({
                message: "You can't add same company",
                success: false
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully",
            company,
            success: true
        });

    } catch (error) {
        console.log("Register Company Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



export const getCompany = async (req, res) => {
    try {
        const userId = req.id;

        const companies = await Company.find({
            userId
        });

        return res.status(200).json({
            companies,
            success: true
        });

    } catch (error) {
        console.log("Get Companies Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Company not found!",
                success: false
            });
        }

        return res.status(200).json({
            company,
            success: true
        });

    } catch (error) {
        console.log("Get Company By ID Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const updateCompany = async (req, res) => {
    try {
        const {
            name,
            description,
            website,
            location
        } = req.body;

        const file = req.file;

        console.log("Update Company Data:", {
            name,
            description,
            website,
            location,
            hasFile: !!file
        });

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        company.name = name;
        company.description = description;
        company.website = website;
        company.location = location;

        if (file) {
            const fileURI = getDataUri(file);

            const cloudResponse = await cloudinary.uploader.upload(
                fileURI.content,
                {
                    resource_type: "auto"
                }
            );

            company.logo = cloudResponse.secure_url;
        }

        await company.save();

        return res.status(200).json({
            message: "Company information updated.",
            company,
            success: true
        });

    } catch (error) {
        console.log("Update Company Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const deletecompany = async (req, res) => {
    try {
        const companyId = req.params.id;

        // 1. Check whether company exists
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        // 2. Find all jobs belonging to this company
        const jobs = await Job.find({
            company: companyId
        }).select("_id");

        const jobIds = jobs.map((job) => job._id);

        // 3. Delete applications related to those jobs
        if (jobIds.length > 0) {
            await Application.deleteMany({
                job: { $in: jobIds }
            });
        }
        await Job.deleteMany({
            company: companyId
        });
        await Company.findByIdAndDelete(companyId);

        return res.status(200).json({
            message:
                "Company, related jobs and applications deleted successfully",
            success: true
        });

    } catch (error) {
        console.log("Delete Company Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};