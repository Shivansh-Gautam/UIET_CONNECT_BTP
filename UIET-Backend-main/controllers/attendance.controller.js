const mongoose = require("mongoose");
const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");
const Subject = require("../models/subject.model");
const AttendancePDF = require("../models/attendancePDF.model");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { PassThrough } = require("stream");

module.exports = {
  // Check attendance for a specific semester
  checkAttendance: async (req, res) => {
    try {
      const { semesterId } = req.params;

      // Find subjects in semester and user's department
      const subjects = await Subject.find({ student_class: semesterId, department: req.user.departmentId });

      const attendanceData = {};

      for (const subject of subjects) {
        const attendanceRecords = await Attendance.find({ subject: subject._id })
          .populate('student')
          .lean();

        attendanceData[subject.subject_name] = attendanceRecords.map(record => ({
          studentName: `${record.student.first_name} ${record.student.last_name}`,
          status: record.status,
          date: record.date,
        }));
      }

      res.status(200).json({ success: true, data: attendanceData });
    } catch (error) {
      console.log("Error checking attendance", error);
      res.status(500).json({ success: false, message: "Server error checking attendance" });
    }
  },

  // Fetch attendance records for a specific student
  getAttendance: async (req, res) => {
    try {
      const { studentId } = req.params;
      const attendanceRecords = await Attendance.find({ student: studentId })
        .populate('subject', 'subject_name')
        .lean();

      const attendanceData = attendanceRecords.map(record => ({
        subjectName: record.subject.subject_name,
        status: record.status,
        date: record.date,
      }));

      res.status(200).json({ success: true, data: attendanceData });
    } catch (error) {
      console.log("Error fetching attendance for student", error);
      res.status(500).json({ success: false, message: "Server error fetching attendance for student" });
    }
  },

  // Record attendance for a student
  recordAttendance: async (req, res) => {
    try {
      const { subjectId, date, attendanceData } = req.body;

      if (!subjectId || !date || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ success: false, message: "Missing required fields or attendance data" });
      }

      for (const record of attendanceData) {
        const { studentId, status } = record;
        if (!studentId || status == null) {
          return res.status(400).json({ success: false, message: "Missing studentId or status in attendance data" });
        }

        const existingRecord = await Attendance.findOne({ student: studentId, subject: subjectId, date: date });
        if (existingRecord) {
          existingRecord.status = status;
          await existingRecord.save();
        } else {
          const attendance = new Attendance({
            student: studentId,
            subject: subjectId,
            status,
            date,
          });
          await attendance.save();
        }
      }

      res.status(201).json({ success: true, message: "Attendance recorded successfully" });
    } catch (error) {
      console.log("Error recording attendance", error);
      res.status(500).json({ success: false, message: "Server error recording attendance" });
    }
  },

  // Generate attendance PDF for a subject and date and save to DB
generateAttendancePDF: async (req, res) => {
  try {
    const { subjectId, date } = req.params;
    const teacherName = req.user.name || (req.user._doc && req.user._doc.name);
    const Teacher = require("../models/teacher.model");

    if (!teacherName) {
      return res.status(400).json({ success: false, message: "Teacher name not found in user data" });
    }

    const teacherDoc = await Teacher.findOne({ name: teacherName });
    if (!teacherDoc) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    const teacherId = teacherDoc._id;

    const subject = await Subject.findOne({ _id: subjectId, department: req.user.department });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found or access denied" });
    }

    const attendanceRecords = await Attendance.find({ subject: subjectId, date })
      .populate('student')
      .lean();

    const PDFDocument = require('pdfkit');
    const { PassThrough } = require('stream');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const stream = new PassThrough();
    const buffers = [];

    stream.on('data', chunk => buffers.push(chunk));
    stream.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const existingPDF = await AttendancePDF.findOne({ teacher: teacherId, subject: subjectId, date });
      if (existingPDF) {
        existingPDF.pdfData = pdfBuffer;
        existingPDF.createdAt = new Date();
        await existingPDF.save();
      } else {
        const attendancePDF = new AttendancePDF({
          teacher: teacherId,
          subject: subjectId,
          date: date,
          pdfData: pdfBuffer,
        });
        await attendancePDF.save();
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="attendance_${subject.subject_name}_${date}.pdf"`);
      res.send(pdfBuffer);
    });

    doc.pipe(stream);

    // === Setup ===
    const col1 = 50;
    const col2 = 130;
    const col3 = 450;
    const rowHeight = 20;
    const maxY = 750; // near bottom of A4
    const maxRowsPerPage = 30;

    // === Header ===
    const drawHeader = () => {
      doc.font('Helvetica-Bold').fontSize(20).text('Attendance Report', { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(12);
      doc.text(`Subject: ${subject.subject_name}`);
      doc.text(`Date: ${date}`);
      doc.text(`Teacher: ${teacherName}`);
      doc.moveDown(1);

      // Table Header
      doc.font('Helvetica-Bold').fontSize(12);
      const headerY = doc.y;
      doc.text('S.No', col1, headerY);
      doc.text('Student Name', col2, headerY);
      doc.text('Status', col3, headerY);
      doc.moveTo(col1, headerY + 15).lineTo(550, headerY + 15).stroke();
      doc.moveDown(1);
    };

    drawHeader();

    // === Attendance List ===
    attendanceRecords.sort((a, b) => (a.status === 'Absent') - (b.status === 'Absent'));
    let presentCount = 0;
    let rowCount = 0;

    attendanceRecords.forEach((record, index) => {
      const studentName = record.student?.name || "Unknown";
      const status = record.status;
      if (status === 'Present') presentCount++;

      // Add new page if max rows per page reached or close to bottom
      if (rowCount >= maxRowsPerPage || doc.y + rowHeight > maxY) {
        doc.addPage();
        drawHeader();
        rowCount = 0;
      }

      doc.font('Helvetica').fontSize(11);
      const rowY = doc.y;
      doc.text(`${index + 1}`, col1, rowY);
      doc.text(studentName, col2, rowY, { width: 280, ellipsis: true });
      doc.text(status, col3, rowY);
      doc.moveDown(0.5);
      rowCount++;
    });

    // === Summary ===
    const total = attendanceRecords.length;
    const absentCount = total - presentCount;
    const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(2) : "0.00";

    if (doc.y + 100 > maxY) doc.addPage();

    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(13).text('Summary', { underline: true });
    doc.moveDown(0.5);

    const summaryTop = doc.y;
    doc.roundedRect(45, summaryTop, 510, 80, 8).stroke();

    doc.font('Helvetica').fontSize(11);
    doc.text(`Total Students: ${total}`, 60, summaryTop + 10);
    doc.text(`Present: ${presentCount}`, 60, summaryTop + 30);
    doc.text(`Absent: ${absentCount}`, 270, summaryTop + 10);
    doc.text(`Attendance Percentage: ${percentage}%`, 270, summaryTop + 30);

    // === Signature ===
    doc.moveDown(6);
    const sigY = doc.y;
    doc.moveTo(420, sigY).lineTo(570, sigY).stroke();
    doc.font('Helvetica-Oblique').fontSize(10).text("Teacher's Signature", 440, sigY + 5);

    doc.end();

  } catch (error) {
    console.error("Error generating attendance PDF", error);
    res.status(500).json({ success: false, message: "Server error generating attendance PDF" });
  }
},



   // Fetch stored PDFs filtered by logged-in teacher
   getAttendancePDFsByTeacher: async (req, res) => {
     try {
       const teacherName = req.user.name || (req.user._doc && req.user._doc.name);
       const Teacher = require("../models/teacher.model");

       if (!teacherName) {
         return res.status(400).json({ success: false, message: "Teacher name not found in user data" });
       }

       // Find teacher document by name
       const teacherDoc = await Teacher.findOne({ name: teacherName });
       if (!teacherDoc) {
         return res.status(404).json({ success: false, message: "Teacher not found" });
       }
       const teacherId = teacherDoc._id;

       const attendancePDFs = await AttendancePDF.find({ teacher: teacherId })
         .populate({
           path: 'subject',
           select: 'subject_name year',
           populate: {
             path: 'year',
             select: 'semester_text semester_num'
           }
         })
         .lean();

       const pdfList = attendancePDFs.map(pdf => ({
         id: pdf._id,
         subjectName: pdf.subject.subject_name,
         date: pdf.date,
         semesterText: pdf.subject.year ? pdf.subject.year.semester_text : "Unknown Year",
         semesterNum: pdf.subject.year ? pdf.subject.year.semester_num : null,
       }));

       res.status(200).json({ success: true, data: pdfList });
     } catch (error) {
       console.log("Error fetching attendance PDFs by teacher", error);
       res.status(500).json({ success: false, message: "Server error fetching attendance PDFs" });
     }
   },

   // Fetch PDF data by PDF id
   getAttendancePDFById: async (req, res) => {
     try {
       const pdfId = req.params.pdfId;
       const teacherName = req.user.name || (req.user._doc && req.user._doc.name);
       const Teacher = require("../models/teacher.model");

       if (!teacherName) {
         return res.status(400).json({ success: false, message: "Teacher name not found in user data" });
       }

       // Find teacher document by name
       const teacherDoc = await Teacher.findOne({ name: teacherName });
       if (!teacherDoc) {
         return res.status(404).json({ success: false, message: "Teacher not found" });
       }
       const teacherId = teacherDoc._id;

       const attendancePDF = await AttendancePDF.findOne({ _id: pdfId, teacher: teacherId });
       if (!attendancePDF) {
         return res.status(404).json({ success: false, message: "PDF not found or access denied" });
       }

       res.setHeader('Content-Type', 'application/pdf');
       res.setHeader('Content-Disposition', `inline; filename="attendance_${attendancePDF.subject.subject_name}_${attendancePDF.date.toISOString().split('T')[0]}.pdf"`);
       res.send(attendancePDF.pdfData);
     } catch (error) {
       console.log("Error fetching attendance PDF by id", error);
       res.status(500).json({ success: false, message: "Server error fetching attendance PDF" });
      }
    }
  }

