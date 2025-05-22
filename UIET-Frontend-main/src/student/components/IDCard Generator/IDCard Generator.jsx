import PropTypes from "prop-types";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import html2canvas from "html2canvas"; // Import for capturing the card
import logo from "../../../assets/logo.png";
import sign from "../../../assets/ProctorSign.png"; // Import the signature image

const StudentIDCard = React.forwardRef(({ student }, ref) => {
  if (!student) return null;

  const renderField = (label, value) => (
    <Box display="flex" mb={0.8}>
      <Typography
        fontWeight="bold"
        fontSize="12px"
        color="red"
        sx={{ width: 130, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography fontWeight="bold" fontSize="12px" color="black">
        : {value}
      </Typography>
    </Box>
  );

  return (
    <Paper
      ref={ref}
      elevation={10}
      sx={{
        width: 520,
        height: 400, // Increased a little to fit blue footer
        borderRadius: 2,
        overflow: "hidden",

        position: "relative",
        backgroundColor: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#b91c1c",
          color: "white",
          textAlign: "center",
          justifyContent: "center",
          p: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar src={logo} sx={{ width: 50, height: 50, m: 1 }} />
        <Box
          sx={{
            textAlign: "center",
            p: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontSize="14px" fontWeight="bold">
            CHHATRAPATI SHAHU JI MAHARAJ UNIVERSITY, KANPUR
          </Typography>
          <Typography variant="caption" fontSize="10px">
            (Formerly Known as Kanpur University)
          </Typography>
        </Box>
      </Box>

      {/* Top Info */}
      <Box
        sx={{
          textAlign: "center",
          pt: 2,
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Typography
          variant="h6"
          fontSize="14px"
          marginTop={"10px"}
          fontWeight="bold"
          color="#0c3c90"
        >
          {student.rollNo}
        </Typography>
        <Typography
          color="#0c3c90"
          variant="h4"
          fontSize="20px"
          marginBottom={"3px"}
          fontWeight="bold"
        >
          Student ID Card
        </Typography>
        <Typography
          variant="h6"
          fontWeight="bold"
          marginTop={"10px"}
          fontSize="14px"
          color="#0c3c90"
          mb={1}
        >
          Valid Upto : {student.validUpto}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {/* Left Section */}
          <Grid item xs={9}>
            {renderField("Roll No.", student.rollNo)}
            {renderField("Name", student.name)}
            {renderField("Father's Name", student.fatherName)}
            {renderField("Course", student.course)}
            {renderField("Department", student.department)}
            {renderField("Session/Batch", student.batch)}
            {renderField("Phone No.", student.phone)}
          </Grid>

          {/* Right Section */}
          <Grid
            item
            xs={3}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            gap={"5px"}
            justifyContent={"flex-start"}
          >
            {/* Student Photo */}
            <Box
              sx={{
                width: 100,
                height: 120,
                border: "2px solid black",
                backgroundColor: "white",
                mx: "auto",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {student.photoUrl ? (
                <Avatar
                  src={student.photoUrl}
                  alt="Student"
                  variant="square"
                  sx={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  No Photo
                </Typography>
              )}
            </Box>

            {/* Signature Image */}
            <Box
              sx={{
                width: 80,
                height: 40,
                backgroundColor: "white",
                mx: "auto",
                overflow: "hidden",
              }}
            >
              <Avatar
                src={sign}
                alt="Signature"
                variant="square"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography fontSize="12px" fontWeight="bold">
              Chief Proctor
            </Typography>

            {/* Chief Proctor Text */}
          </Grid>
        </Grid>
      </Box>

      {/* Blue Footer */}
      <Box
        sx={{
          backgroundColor: "#0c3c90",
          height: "50px",
          width: "100%",
          position: "absolute",
          bottom: 0,
        }}
      />
    </Paper>
  );
});

StudentIDCard.displayName = "StudentIDCard";

StudentIDCard.propTypes = {
  student: PropTypes.shape({
    rollNo: PropTypes.string.isRequired,
    validUpto: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fatherName: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    batch: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    photoUrl: PropTypes.string,
  }).isRequired,
};

const IdGenerator = () => {
  const [student, setStudent] = useState({
    rollNo: "",
    name: "",
    fatherName: "",
    course: "",
    department: "",
    batch: "",
    phone: "",
    photoUrl: "",
    validUpto: "",
  });

  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStudent((prevStudent) => ({ ...prevStudent, photoUrl: imageUrl }));
    }
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current);
      const link = document.createElement("a");
      link.download = `${student.name.replace(/\s+/g, "_")}_ID_Card.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        Generate Student ID Card
      </Typography>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={2}>
          {[
            { name: "rollNo", label: "Roll " },
            { name: "name", label: "Name" },
            { name: "fatherName", label: "Father's Name" },
            { name: "course", label: "Course" },
            { name: "department", label: "Department" },
            { name: "batch", label: "Session/Batch" },
            { name: "phone", label: "Phone No." },
            { name: "validUpto", label: "Valid Upto (DD/MM/YYYY)" },
          ].map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                value={student[field.name]}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
          ))}

          {/* Upload Photo */}
          <Grid item xs={12}>
            <Button variant="contained" component="label" fullWidth>
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
              />
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Generated ID Card */}
      <Box display="flex" justifyContent="center">
        <StudentIDCard ref={cardRef} student={student} />
      </Box>

      {/* Download Button */}
      {student.name && (
        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="primary" onClick={handleDownload}>
            Download ID Card
          </Button>
        </Box>
      )}
    </Container>
  );
};
export default IdGenerator;