import { useState, useEffect } from "react";
import { periodSchema } from "../../../yupSchema/periodSchema";
import { baseApi } from "../../../environment";
import axios from "axios";
import { useFormik } from "formik";
import { Box, MenuItem, TextField, Button, Typography } from "@mui/material";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";

export default function ScheduleEvent({ selectedSemester, onEventAdded }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const periods = [
    { id: 1, label: "Monday", day: 1 },
    { id: 2, label: "Tuesday", day: 2 },
    { id: 3, label: "Wednesday", day: 3 },
    { id: 4, label: "Thursday", day: 4 },
    { id: 5, label: "Friday", day: 5 },
    { id: 6, label: "Saturday", day: 6 },
  ];

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (selectedSemester) {
      fetchData();
      formik.setFieldValue("semester", selectedSemester); // Set semester field when selectedSemester changes
    }
  }, [selectedSemester]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const [teacherResponse, subjectResponse] = await Promise.all([
        axios.get(`${baseApi}/teacher/fetch-with-query`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseApi}/subject/fetch-with-query`, {
          params: { student_class: selectedSemester },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTeachers(teacherResponse.data.teachers || []);
      setSubjects(subjectResponse.data.subjects || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({ open: true, message: "Failed to fetch data", severity: "error" });
    }
  };

  const formik = useFormik({
    initialValues: {
      teacher: "",
      subject: "",
      semester: selectedSemester || "", // Set semester value dynamically
      day: "", 
      startTime: "",
      endTime: "",
    },
    validationSchema: periodSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const token = localStorage.getItem("authToken");

        const scheduleData = {
          teacher: values.teacher,
          subject: values.subject,
          semester:selectedSemester,
          day: values.day, // Ensure it's a number
          startTime: values.startTime,
          endTime: values.endTime,
        };

        console.log("Submitting schedule:", scheduleData); // Debugging

        const response = await axios.post(`${baseApi}/schedule/create`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Schedule saved successfully:", response.data);
        setSnackbar({ open: true, message: "Schedule added successfully", severity: "success" });

        resetForm();
        onEventAdded(); // Call the callback to update the UI
      } catch (error) {
        console.error("Error saving schedule:", error.response?.data || error);
        setSnackbar({ open: true, message: error.response?.data?.message || "Error saving schedule", severity: "error" });
      }
    }
  });

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Schedule Event
      </Typography>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }} onSubmit={formik.handleSubmit}>
        <TextField
          select
          fullWidth
          label="Teacher"
          variant="outlined"
          name="teacher"
          value={formik.values.teacher}
          onChange={formik.handleChange}
          error={formik.touched.teacher && Boolean(formik.errors.teacher)}
          helperText={formik.touched.teacher && formik.errors.teacher}
        >
          {teachers.map((x) => (
            <MenuItem key={x._id} value={x._id}>
              {x.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Subject"
          variant="outlined"
          name="subject"
          value={formik.values.subject}
          onChange={formik.handleChange}
          error={formik.touched.subject && Boolean(formik.errors.subject)}
          helperText={formik.touched.subject && formik.errors.subject}
        >
          {subjects.length > 0 ? (
            subjects.map((x) => (
              <MenuItem key={x._id} value={x._id}>
                {x.subject_name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No subjects available</MenuItem>
          )}
        </TextField>

        <TextField
          select
          fullWidth
          label="Day"
          variant="outlined"
          name="day"
          value={formik.values.day}
          onChange={(e) => formik.setFieldValue("day", Number(e.target.value))} // Ensure number type
          error={formik.touched.day && Boolean(formik.errors.day)}
          helperText={formik.touched.day && formik.errors.day}
        >
          {periods.map((x) => (
            <MenuItem key={x.id} value={x.id}>
              {x.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Start Time"
          type="time"
          variant="outlined"
          name="startTime"
          value={formik.values.startTime}
          onChange={formik.handleChange}
          error={formik.touched.startTime && Boolean(formik.errors.startTime)}
          helperText={formik.touched.startTime && formik.errors.startTime}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          fullWidth
          label="End Time"
          type="time"
          variant="outlined"
          name="endTime"
          value={formik.values.endTime}
          onChange={formik.handleChange}
          error={formik.touched.endTime && Boolean(formik.errors.endTime)}
          helperText={formik.touched.endTime && formik.errors.endTime}
          InputLabelProps={{ shrink: true }}
        />

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
}
