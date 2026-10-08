import express from "express";

import isAuthenticated from "../middlewares/isAuthenticted.js";

import {
    getCompany,
    getCompanyById,
    registerCompany,
    updateCompany,
    deletecompany
} from "../controllers/company.controller.js";

import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Register company
router
    .route("/register")
    .post(isAuthenticated, registerCompany);

// Get all companies
router
    .route("/get")
    .get(isAuthenticated, getCompany);

// Get company by ID
router
    .route("/get/:id")
    .get(isAuthenticated, getCompanyById);

// Update company
router
    .route("/update/:id")
    .put(isAuthenticated, singleUpload, updateCompany);

    // delete company
router
    .route("/delete/:id")
    .delete(isAuthenticated, singleUpload, deletecompany);

export default router;