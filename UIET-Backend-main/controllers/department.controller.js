require("dotenv").config();
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const Department = require("../models/department.model");

module.exports = {
  registerDepartment: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        const department = await Department.findOne({ email: fields.email[0] });
        if (department) {
          return res
            .status(409)
            .json({
              success: false,
              message: "Department already exists with this email.",
            });
        } else {
          const photo = files.image[0];
          let filepath = photo.filepath;
          let originalFilename = photo.originalFilename.replace(" ", "_");

          // Upload image to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(filepath, {
            folder: "department_images",
            public_id: originalFilename.split(".")[0],
            overwrite: true,
          });

          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(fields.password[0], salt);
          const newDepartment = new Department({
            department_name: fields.department_name[0],
            email: fields.email[0],
            hod_name: fields.hod_name[0],
            department_image: uploadResult.secure_url,
            password: hashPassword,
          });

          const savedDepartment = await newDepartment.save();
          res.status(200).json({
            success: true,
            data: savedDepartment,
            message: "department registered successfully",
          });
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "department registration failed" });
    }
  },

  //login for department
  loginDepartment: async (req, res) => {
    try {
      const department = await Department.findOne({ email: req.body.email });
      if (department) {
        const isAuth = bcrypt.compareSync(
          req.body.password,
          department.password
        );
        if (isAuth) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: department._id,
              department: department._id,
              department_name: department.department_name,
              image_url: department.department_image,
              hod_name: department.hod_name,
              role: "DEPARTMENT",
            },
            jwtSecret
          );

          res.header("Authorization", token);
          res.status(200).json({
            success: true,
            message: "successfully login",
            user: {
              id: department._id,
              department_name: department.department_name,
              image_url: department.department_image,
              hod_name: department.hod_name,
              role: "DEPARTMENT",
            },
          });
        } else {
          res.status(401).json({ success: false, message: "invalid password" });
        }
      } else {
        res
          .status(401)
          .json({ success: false, message: "department not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[department login].",
      });
    }
  },
  // get all department data
  getAllDepartments: async (req, res) => {
    try {
      const departments = await Department.find().select([
        "-password",
        "-id",
        "-email",
        "-hod_name",
        "-createdAt",
      ]);
      res.status(200).json({
        success: true,
        message: "success in fetching all departments",
        departments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[all department]",
      });
    }
  },

  //get department own data
  getDepartmentOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const department = await Department.findOne({ _id: id }).select([
        "-password",
      ]);
      if (department) {
        res.status(200).json({ success: true, department });
      } else {
        res
          .status(404)
          .json({ success: false, message: "department not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  department data]",
      });
    }
  },
  updateDepartment: async (req, res) => {
    try {
      const id = req.user.id;
      const form = new formidable.IncomingForm();
  
      // Handle form parsing errors
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error in form parsing" });
        }
  
        const department = await Department.findOne({ _id: id });
        if (!department) {
          return res.status(404).json({ success: false, message: "Department not found" });
        }
  
      // Handle image upload
      if (files.image) {
        const photo = files.image[0];
        let filepath = photo.filepath;
        let originalFilename = photo.originalFilename.replace(" ", "_");

        // Optionally, delete old image from Cloudinary if you store public_id
        // For now, skipping deletion of old image on Cloudinary

        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filepath, {
          folder: "department_images",
          public_id: originalFilename.split(".")[0],
          overwrite: true,
        });

        // Update the department's image field with Cloudinary URL
        department.department_image = uploadResult.secure_url;
      }
  
        // Update other fields
        if (fields.password) {
          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(fields.password[0], salt);
          department.password = hashPassword;
        }
        Object.keys(fields).forEach((field) => {
          if (field !== 'password') {
            department[field] = fields[field][0];
          }
        });
  
        // Save the updated department
        await department.save();
  
        // Return the updated department with the new image
        res.status(200).json({
          success: true,
          message: "Department updated successfully",
          department,
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error updating department" });
    }
  },
};
