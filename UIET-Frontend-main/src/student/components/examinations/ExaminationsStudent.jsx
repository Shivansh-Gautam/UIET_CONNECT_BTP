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
import { baseApi } from "../../../environment";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";

export default function ExaminationsStudent() {
  const token = localStorage.getItem("authToken");
  const [examinations, setExaminations] = React.useState([]);
  const [semesters, setSemesters] = React.useState([]);
  const [setSubjects] = React.useState([]);
  const [editId, setEditId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await axios.get(`${baseApi}/api/semester/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemesters(res.data.data || []);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to fetch semesters.",
          severity: "error",
          error,
        });
      }
    };
    fetchSemesters();
  }, [token]);

  const fetchSubjects = async (semesterId) => {
    if (!semesterId) return; // Do not fetch if semesterId is falsy
    setSnackbar({ ...snackbar, open: false }); // Clear previous snackbar before fetching
    try {
      const res = await axios.get(`${baseApi}/api/subject/fetch-with-query`, {
        params: { year: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 && res.data && res.data.subjects) {
        setSubjects(res.data.subjects);
      } else {
        console.log("fetchSubjects error response data:", res.data);
        // Removed snackbar error message for failed subject fetch to avoid showing "Failed to fetch subjects."
        // setSnackbar({
        //   open: true,
        //   message: "Failed to fetch subjects.",
        //   severity: "error",
        // });
      }
    } catch (error) {
      console.error("fetchSubjects error:", error);
      // Removed snackbar error message for failed subject fetch to avoid showing "Failed to fetch subjects."
      // setSnackbar({
      //   open: true,
      //   message: "Failed to fetch subjects.",
      //   severity: "error",
      //   error,
      // });
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
      setSnackbar({
        open: true,
        message: "Failed to fetch examinations.",
        severity: "error",
        error,
      });
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
        setSnackbar({
          open: true,
          message: "Exam Date is required!",
          severity: "error",
        });
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
          setSnackbar({
            open: true,
            message: "Exam updated successfully",
            severity: "success",
          });
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
          setSnackbar({
            open: true,
            message: "Exam created successfully!",
            severity: "success",
          });
        }

        fetchExaminations(values.semester); // Keep the semester
        setFieldValue("examDate", "");
        setFieldValue("subject", "");
        setFieldValue("examType", "");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to create exam.",
          severity: "error",
          error,
        });
      }
    },
  });

  // Removed unused handleEdit function

  // Removed unused handleDelete function

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
              if (semesterId) {
                fetchSubjects(semesterId);
                fetchExaminations(semesterId);
              }
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
