import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import axios from "axios";
import { useFormik } from "formik";
import { examinationSchema } from "../../../yupSchema/examinationSchema";
import { baseApi } from "../../../environment";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { Delete, Edit } from "@mui/icons-material";

export default function Examinations() {
  const token = localStorage.getItem("authToken");
  const [examinations, setExaminations] = React.useState([]);
  const [semesters, setSemesters] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
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
      setSnackbar({
        open: true,
        message: "Failed to fetch semesters.",
        severity: "error",
      });
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await axios.get(`${baseApi}/api/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data.subjects || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch subjects.",
        severity: "error",
      });
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
        });
      }
    },
  });

  const handleEdit = (exam) => {
    setEditId(exam._id);
    formik.setValues({
      examDate: exam.examDate,
      semester: exam.semester?._id || "",
      subject: exam.subject?._id || "",
      examType: exam.examType,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure You want to delete?")) {
      try {
        await axios.get(`${baseApi}/api/examination/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Exam deleted successfully",
          severity: "success",
        });
        fetchExaminations(formik.values.semester); // Refresh exams without resetting semester
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting Exam",
          severity: "error",
        });
      }
    }
  };

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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            {editId ? "Edit Exam" : "Add New Exam"}
          </Typography>

          {/* Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Exam Date"
              value={
                formik.values.examDate ? dayjs(formik.values.examDate) : null
              }
              onChange={(newValue) => {
                if (newValue) {
                  formik.setFieldValue(
                    "examDate",
                    dayjs(newValue).format("YYYY-MM-DD")
                  );
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error:
                    formik.touched.examDate && Boolean(formik.errors.examDate),
                  helperText: formik.touched.examDate && formik.errors.examDate,
                },
              }}
            />
          </LocalizationProvider>

          {/* Subject Selection */}
          <TextField
            select
            fullWidth
            label="Subject"
            name="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Subject</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subject_name}
              </MenuItem>
            ))}
          </TextField>

          {/* Exam Type */}
          <TextField
            fullWidth
            label="Exam Type"
            name="examType"
            {...formik.getFieldProps("examType")}
            error={formik.touched.examType && Boolean(formik.errors.examType)}
            helperText={formik.touched.examType && formik.errors.examType}
            sx={{ mb: 2 }}
          />

          {/* Submit Button */}
          <Button type="submit" variant="contained" fullWidth>
            {editId ? "Update" : "Submit"}
          </Button>
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
              <TableCell align="left">Actions</TableCell>
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
                  <TableCell align="left">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(exam)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(exam._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
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
