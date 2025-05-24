import * as React from "react";
import {
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";
import { useFormik } from "formik";
import { examinationSchema } from "../../../yupSchema/examinationSchema";
import { baseApi } from "../../../environment.js";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
export default function ExaminationsTeacher() {
  const token = localStorage.getItem("authToken");
  const [examinations, setExaminations] = React.useState([]);
  const [semesters, setSemesters] = React.useState([]);
  // Removed unused state variables: subjects, handleEdit, handleDelete, snackbar
  const [editId, setEditId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${baseApi}/api/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(res.data.data || []);
    } catch (error) {
      // Removed snackbar error handling
      console.error("Failed to fetch semesters.");
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await axios.get(`${baseApi}/api/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Removed setSubjects call
    } catch (error) {
      // Removed snackbar error handling
      console.error("Failed to fetch subjects.");
    }
  };

  const fetchExaminations = async (semesterId) => {
    if (!semesterId) return;
    try {
      const res = await axios.get(
        `${baseApi}/api/examination/semester/${semesterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExaminations(res.data.examinations || []);
    } catch (error) {
      // Removed snackbar error handling
      console.error("Failed to fetch examinations.");
    }
  };

  const formik = useFormik({
    initialValues: {
      examDate: "",
      semester: "",
      subject: "",
      examType: "",
    },
    validationSchema: examinationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setFieldValue }) => {
      const formattedDate = values.examDate
        ? dayjs(values.examDate).format("YYYY-MM-DD")
        : null;

      if (!formattedDate) {
        // Removed snackbar error handling
        console.error("Exam Date is required!");
        return;
      }

      try {
        if (editId) {
          await axios.patch(
            `${baseApi}/api/examination/update/${editId}`,
            values,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Removed snackbar success handling
          setEditId(null);
        } else {
          await axios.post(
            `${baseApi}/api/examination/create`,
            {
              date: formattedDate,
              examType: values.examType,
              subjectId: values.subject,
              semesterId: values.semester,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Removed snackbar success handling
        }

        fetchExaminations(values.semester); // Keep the semester
        setFieldValue("examDate", "");
        setFieldValue("subject", "");
        setFieldValue("examType", "");
      } catch (error) {
        // Removed snackbar error handling
        console.error("Failed to create exam.");
      }
    },
  });

  // Removed handleEdit and handleDelete functions

  return (
    <>
      <Box
        sx={{ width: "24vw", minWidth: "330px", margin: "auto" }}
        component="form"
        noValidate
        onSubmit={formik.handleSubmit}
        autoComplete="off"
      >
        <Paper sx={{ p: 3 }}>
          {/* Semester Selection */}
          <TextField
            select
            fullWidth
            label="Year"
            name="semester"
            value={formik.values.semester}
            onChange={(e) => {
              const semesterId = e.target.value;
              formik.setFieldValue("semester", semesterId);
              fetchSubjects(semesterId);
              fetchExaminations(semesterId);
            }}
            error={formik.touched.semester && Boolean(formik.errors.semester)}
            helperText={formik.touched.semester && formik.errors.semester}
            sx={{ mb: 2 }}
            disabled={Boolean(editId)} // Disable semester selection when editing
          >
            <MenuItem value="">Select Year</MenuItem>
            {semesters.map((x) => (
              <MenuItem key={x._id} value={x._id}>
                {x.semester_text} ({x.semester_num})
              </MenuItem>
            ))}
          </TextField>
        </Paper>
      </Box>

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      {/* Exam List Table */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Exam Date</TableCell>
              <TableCell align="left">Subject</TableCell>
              <TableCell align="left">Semester</TableCell>
              <TableCell align="left">Exam Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examinations.length > 0 ? (
              examinations.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell align="left">
                    {dayjs(exam.examDate).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="left">
                    {exam.subject?.subject_name || "N/A"}
                  </TableCell>
                  <TableCell align="left">
                    {exam.semester?.semester_num || "N/A"}
                  </TableCell>
                  <TableCell align="left">{exam.examType}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No exams found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
