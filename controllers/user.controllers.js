import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const {
            fullname,
            email,
            phoneNumber,
            password,
            role
        } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: "Profile photo is required",
                success: false
            });
        }

        const fileUri = getDataUri(file);
        
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: "auto",
            timeout: 60000
        });

        const normalizedRole = role.toLowerCase();

        if (!["student", "recruiter"].includes(normalizedRole)) {
            return res.status(400).json({
                message: "Invalid role",
                success: false
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists with this email.",
                success: false
            });
        }   

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role: normalizedRole,
            profile:{
                ProfilePhoto: cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account Created Successfully",
            success: true
        });

    } catch (error) {
        console.log("Register Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const login = async (req, res) => {
    try {
        const {
            email,
            password,
            role
        } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password and role are required",
                success: false
            });
        }

        const normalizedRole = role.toLowerCase();

        if (!["student", "recruiter"].includes(normalizedRole)) {
            return res.status(400).json({
                message: "Invalid role",
                success: false
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false
            });
        }

        // Check role
        if (normalizedRole !== user.role) {
            return res.status(400).json({
                message: "Account does not exist with current role",
                success: false
            });
        }

        // JWT token
        const tokenData = {
            userId: user._id
        };

        const token = jwt.sign(
            tokenData,
            process.env.SECRET_KEY,
            {
                expiresIn: "1d"
            }
        );

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'strict' 
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user: safeUser,
                success: true
            });

    } catch (error) {
        console.log("Login Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", {
                maxAge: 0
            })
            .json({
                message: "Logged out successfully",
                success: true
            });

    } catch (error) {
        console.log("Logout Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const {
            fullname,
            email,
            phoneNumber,
            bio,
            skills
        } = req.body;

        const file = req.file;
        let cloudResponse = null;

        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "auto",
                timeout: 60000
            });
        }

        let skillsArray;

        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.id;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found!",
                success: false
            });
        }

        if (fullname) {
            user.fullname = fullname;
        }

        if (email) {
            user.email = email;
        }

        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
        }

        if (bio) {
            user.profile.bio = bio;
        }

        if (skillsArray) {
            user.profile.skills = skillsArray;
        }

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: safeUser,
            success: true
        });

    } catch (error) {
        console.log("Update Profile Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};