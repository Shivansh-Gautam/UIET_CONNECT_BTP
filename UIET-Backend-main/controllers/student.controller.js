require("dotenv").config();
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const Student = require("../models/student.model");

module.exports = {
    registerStudent: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error in form parsing" });
        }
        (async () => {
          try {
            const student = await Student.findOne({ email: fields.email[0] });
            if (student) {
              return res.status(409).json({
                success: false,
                message: "Student already exists with this email.",
              });
            } else {
              const photo = files.image[0];
              let filepath = photo.filepath;

              // Upload image to Cloudinary
              const result = await cloudinary.uploader.upload(filepath, {
                folder: "student_images",
              });

              const salt = bcrypt.genSaltSync(10);
              const hashPassword = bcrypt.hashSync(fields.password[0], salt);
              const newStudent = new Student({
                department: req.user.department,
                email: fields.email[0],
                dob: fields.dob[0],
                rollNo: fields.rollNo[0],
                name: fields.name[0],
                student_class: fields.student_class[0],
                gender: fields.gender[0],
                age: fields.age[0],
                student_contact: fields.student_contact[0],
                guardian: fields.guardian[0],
                guardian_phone: fields.guardian_phone[0],
                student_image: result.secure_url, // Store Cloudinary URL
                password: hashPassword,
              });

              const savedStudent = await newStudent.save();
              res.status(200).json({
                success: true,
                data: savedStudent,
                message: "Student registered successfully",
              });
            }
          } catch (error) {
            console.error("Error in registerStudent form parse async callback:", error);
            res.status(500).json({ success: false, message: "Student registration failed" });
          }
        })();
      });
    } catch (error) {
      console.error("Student registration failed:", error);
      res
        .status(500)
        .json({ success: false, message: "Student registration failed" });
    }
  },

  //login for Student
  loginStudent: async (req, res) => {
    try {
      console.log('Login attempt for email:', req.body.email); // Debug log
      const student = await Student.findOne({ email: req.body.email });
      
      if (!student) {
        console.log('Student not found for email:', req.body.email);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials",
          details: {
            suggestion: "Please check your email or register if new",
            code: "EMAIL_NOT_FOUND"
          }
        });
      }

      console.log('Found student:', student.email);
      const isAuth = bcrypt.compareSync(req.body.password, student.password);
      
      if (!isAuth) {
        console.log('Password mismatch for student:', student.email);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials",
          details: {
            suggestion: "Please check your password or reset it if forgotten",
            code: "INVALID_PASSWORD"
          }
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables');
        return res.status(500).json({ 
          success: false, 
          message: "Server configuration error" 
        });
      }

      const token = jwt.sign(
        {
          id: student._id,
          department: student.department,
          name: student.name, // Changed from student_name to name
          image_url: student.student_image,
          role: "STUDENT",
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Generated token for student:', student.email); // Debug log
      res.header("Authorization", token);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: student._id,
          department: student.department,
          name: student.name, // Changed from student_name to name
          image_url: student.student_image,
          role: "STUDENT",
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  // get all Student data
  getStudentsWithQuery: async (req, res) => {
    try {
      const filterQuery = {};
      const department = req.user.department;
      filterQuery["department"] = department;

      if (req.query.hasOwnProperty("search")) {
        filterQuery["name"] = { $regex: req.query.search, $options: "i" };
      }

      if (req.query.hasOwnProperty("student_class")) {
        filterQuery["student_class"] = req.query.student_class;
      }

      const students = await Student.find(filterQuery)
        .populate("student_class");
      res.status(200).json({
        success: true,
        message: "success in fetching all Students",
        students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[all Student]",
      });
    }
  },

  //get Student own data
  getStudentOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const department = req.user.department;
      const student = await Student.findOne({
        _id: id,
        department: department,
      }).populate("student_class", "semester_text").select(["-password"]);
      if (student) {
        res.status(200).json({ success: true, student });
      } else {
        res.status(404).json({ success: false, message: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Student data]",
      });
    }
  },
  getStudentWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const department = req.user.department;
      const student = await Student.findOne({
        _id: id,
        department: department,
      }).select(["-password"]);
      if (student) {
        res.status(200).json({ success: true, student });
      } else {
        res.status(404).json({ success: false, message: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error:[own  Student data]",
      });
    }
  },

    updateStudent: async (req, res) => {
    try {
      const id = req.params.id;

      // Authorization check: if user is STUDENT, allow update only on their own profile
      if (req.user.role === "STUDENT" && req.user.id !== id) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error in form parsing" });
        }
        (async () => {
          try {
            const student = await Student.findOne({ _id: id });
            if (!student) {
              return res.status(404).json({ success: false, message: "Student not found" });
            }

            if (files.image) {
              const photo = files.image[0];
              let filepath = photo.filepath;

              // Delete old image from Cloudinary if exists
              if (student.student_image) {
                try {
                  // Extract public_id from URL
                  const publicId = student.student_image.split('/').pop().split('.')[0];
                  await cloudinary.uploader.destroy(`student_images/${publicId}`);
                } catch (err) {
                  console.log("Error deleting old image from Cloudinary:", err);
                }
              }

              // Upload new image to Cloudinary
              const result = await cloudinary.uploader.upload(filepath, {
                folder: "student_images",
              });

              student.student_image = result.secure_url;
            }

            if (fields.password) {
              const salt = bcrypt.genSaltSync(10);
              const hashPassword = bcrypt.hashSync(fields.password[0], salt);
              student.password = hashPassword;
            }

            Object.keys(fields).forEach((field) => {
              if (field !== 'password') {
                student[field] = fields[field][0];
              }
            });

            await student.save();

            res.status(200).json({ success: true, message: "Student updated successfully", student });
          } catch (error) {
            console.error("Error in updateStudent form parse async callback:", error);
            res.status(500).json({ success: false, message: "Error updating Student" });
          }
        })();
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error updating Student" });
    }
  },

 deleteStudentWithId: async (req, res) => {
  try {
    const id = req.params.id;
    const department = req.user.department;

    const student = await Student.findOne({
      _id: id,
      department: department,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Delete student record from DB
    await Student.findByIdAndDelete(id);

    // Delete image from Cloudinary if exists
    if (student.student_image) {
      try {
        // Extract public_id from URL
        const publicId = student.student_image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`student_images/${publicId}`);
        console.log("Student image deleted from Cloudinary:", student.student_image);
      } catch (err) {
        console.error("Error deleting student image from Cloudinary:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Student:", error);
    return res.status(500).json({ success: false, message: "Error deleting Student" });
  }
}
,

  // Get total students count for a semester and department
  getTotalStudentsCount: async (req, res) => {
    try {
      const department = req.user.department;
      const { semesterId } = req.query;

      if (!semesterId) {
        return res.status(400).json({ message: "semesterId parameter is required" });
      }

      const count = await Student.countDocuments({
        department: department,
        student_class: semesterId,
      });

      res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching total students count:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};