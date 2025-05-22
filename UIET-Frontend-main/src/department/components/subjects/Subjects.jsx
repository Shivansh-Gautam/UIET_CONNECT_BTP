import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Paper,
  Grid,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useFormik } from "formik";
import { subjectSchema } from "../../../yupSchema/subjectSchema";
import axios from "axios";
import { baseApi } from "../../../environment";
import { useEffect, useState } from "react";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";

export default function Subjects() {
  const token = localStorage.getItem("authToken"); // Fetch auth token from local storage

  const [editId, setEditId] = useState(null); // Stores the ID of the subject being edited
  const [semesters, setSemesters] = useState([]); // Stores the list of semesters
  const [subject, setSubject] = useState([]); // Stores the list of subjects

  // Snackbar state for displaying success/error messages
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Search text state
  const [searchText, setSearchText] = useState("");

  // Function to close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Fetch the list of semesters from the backend
  const fetchSemesters = async () => {
    if (!token) {
      setAlert({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      const response = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(response.data.data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setAlert({
        open: true,
        message: "Failed to fetch semesters",
        severity: "error",
      });
    }
  };

  const [params, setParams] = useState({}); // Stores the filtering parameters

  // Handles selecting a semester to filter subjects
  const handleSemester = (e) => {
    const selectedId = e.target.value;
    setParams((prevParams) => ({
      ...prevParams,
      student_class: selectedId || undefined,
    }));
  };

  // Handles search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handles editing a subject (pre-fills the form with existing data)
  const handleEdit = (subject) => {
    setEditId(subject._id);
    formik.setValues({
      subject_name: subject.subject_name,
      subject_codename: subject.subject_codename,
      student_class: subject.year?._id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handles deleting a subject
  const handleDelete = async (id) => {
    try {
      await axios.get(`${baseApi}/subject/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({
        open: true,
        message: "Subject deleted successfully",
        severity: "success",
      });
      fetchSubject(); // Refresh subject list after deletion
    } catch (error) {
      setAlert({
        open: true,
        message: "Error deleting subject",
        severity: "error",
      });
      console.error("Error deleting subject:", error);
    }
  };

  // Fetches the list of subjects based on the selected semester
  const fetchSubject = async () => {
    if (!token) {
      setAlert({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      const response = await axios.get(`${baseApi}/subject/fetch-with-query`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubject(response.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setAlert({
        open: true,
        message: "Failed to fetch subjects",
        severity: "error",
      });
    }
  };

  // Fetch semesters on component mount
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Fetch subjects when filter parameters change
  useEffect(() => {
    fetchSubject();
  }, [params]);

  // Formik for handling subject form submission
  const formik = useFormik({
    initialValues: {
      subject_name: "",
      subject_codename: "",
      student_class: "",
    },
    validationSchema: subjectSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          subject_name: values.subject_name,
          subject_codename: values.subject_codename,
          year: values.student_class,
        };
        if (editId) {
          // Update an existing subject
          await axios.patch(`${baseApi}/subject/update/${editId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({
            open: true,
            message: "Subject updated successfully",
            severity: "success",
          });
        } else {
          // Add a new subject
          await axios.post(`${baseApi}/subject/create`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({
            open: true,
            message: "Subject added successfully",
            severity: "success",
          });
        }
        resetForm();
        setEditId(null);
        fetchSubject(); // Refresh subject list
      } catch (error) {
        setAlert({
          open: true,
          message: "Error processing request",
          severity: "error",
        });
        console.error("Error:", error);
      }
    },
  });

  // Map of student_class._id to year names
  const yearMap = {
    "6808a9d079c6bb24421c5521": "1st Year",
    "6808a9d279c6bb24421c5524": "2nd Year",
    "6808a9d379c6bb24421c5527": "3rd Year",
    "6808a9d379c6bb24421c552a": "4th Year",
  };

  // Group subjects by year._id
  const groupedSubjects = subject.reduce((groups, subj) => {
    const yearId = subj.year?._id || "unknown";
    if (!groups[yearId]) {
      groups[yearId] = [];
    }
    groups[yearId].push(subj);
    return groups;
  }, {});

  // Filter subjects based on search text (case-insensitive match on subject_name or subject_codename)
  const filteredSubjects = subject.filter((subj) => {
    const searchLower = searchText.toLowerCase();
    return (
      subj.subject_name.toLowerCase().includes(searchLower) ||
      subj.subject_codename.toLowerCase().includes(searchLower)
    );
  });

  // Debug logs to verify grouping and mapping
  console.log("Subjects data:", subject);
  console.log("Grouped Subjects keys:", Object.keys(groupedSubjects));
  console.log("Grouped Subjects:", groupedSubjects);
  console.log("Year Map:", yearMap);

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      {/* Form Section */}
      <Paper
        elevation={6}
        sx={{ p: 4, borderRadius: 3, backgroundColor: "#f9fafb" }}
      >
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={formik.handleSubmit}
        >
          <Typography
            variant="h3"
            sx={{ textAlign: "center", fontWeight: 700, color: "#1976d2" }}
          >
            {editId ? "Edit Subject" : "Add New Subject"}
          </Typography>

          <TextField
            select
            fullWidth
            label="Student Year"
            variant="outlined"
            {...formik.getFieldProps("student_class")}
            error={
              formik.touched.student_class &&
              Boolean(formik.errors.student_class)
            }
            helperText={
              formik.touched.student_class && formik.errors.student_class
            }
          >
            {semesters.map((x) => (
              <MenuItem key={x._id} value={x._id}>
                {x.semester_text} ({x.semester_num})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Subject Name"
            variant="outlined"
            {...formik.getFieldProps("subject_name")}
            error={
              formik.touched.subject_name && Boolean(formik.errors.subject_name)
            }
            helperText={
              formik.touched.subject_name && formik.errors.subject_name
            }
          />

          <TextField
            fullWidth
            label="Subject Code"
            variant="outlined"
            {...formik.getFieldProps("subject_codename")}
            error={
              formik.touched.subject_codename &&
              Boolean(formik.errors.subject_codename)
            }
            helperText={
              formik.touched.subject_codename && formik.errors.subject_codename
            }
          />

          <Button fullWidth variant="contained" color="primary" type="submit">
            {editId ? "Update" : "Submit"}
          </Button>
        </Box>
      </Paper>

      {/* Student Year Filter */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <TextField
          select
          fullWidth
          label="Student Year"
          value={params.student_class || ""}
          variant="outlined"
          onChange={handleSemester}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">All Semesters Subjects</MenuItem>
          {semesters.map((x) => (
            <MenuItem key={x._id} value={x._id}>
              {x.semester_text} ({x.semester_num})
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Search Subjects"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search by subject name or code"
        />
      </Box>

      {/* Subject List Section */}
      <Paper
        elevation={6}
        sx={{ mt: 2, p: 4, borderRadius: 3, backgroundColor: "#ffffff" }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            color: "#1976d2",
            marginBottom: "20px",
          }}
        >
          Subjects
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {subject.length === 0 ? (
              <Typography variant="h6" color="textSecondary" textAlign="center">
                No subjects found
              </Typography>
            ) : (
              <>
                {semesters.map((semester) => {
                  // Filter subjects for this semester id from filteredSubjects
                  const subjectsForSemester = filteredSubjects.filter(
                    (subj) => subj.year?._id === semester._id
                  );
                  // If a filter is applied, further filter subjectsForSemester by params.student_class
                  const finalFilteredSubjects = params.student_class
                    ? subjectsForSemester.filter(
                        (subj) => subj.year?._id === params.student_class
                      )
                    : subjectsForSemester;

                  // Only render semester if it has subjects after filtering
                  if (finalFilteredSubjects.length === 0) return null;

                  return (
                    <Grid item xs={12} key={semester._id}>
                      <Paper
                        elevation={4}
                        sx={{
                          p: 2,
                          mb: 3,
                          borderRadius: 3,
                          backgroundColor: "#e8f0fe",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, mb: 2 }}
                        >
                          {semester.semester_text} ({semester.semester_num})
                        </Typography>
                        {finalFilteredSubjects.map((x) => (
                          <Paper
                            key={x._id}
                            elevation={3}
                            sx={{
                              p: 2,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderRadius: 2,
                              backgroundColor: "#ffffff",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {x.subject_name} ({x.subject_codename})
                            </Typography>
                            <Box>
                              <IconButton
                                color="primary"
                                onClick={() => handleEdit(x)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(x._id)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Paper>
                        ))}
                      </Paper>
                    </Grid>
                  );
                })}
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
