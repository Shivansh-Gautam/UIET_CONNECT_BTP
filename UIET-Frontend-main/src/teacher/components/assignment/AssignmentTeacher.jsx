import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
  Autocomplete,
  Paper,
  Modal,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { baseApi } from "../../../environment";

const AssignmentTeacher = () => {
  const [params, setParams] = useState({
    semester: "",
    subject: "",
    dueDate: "",
  });
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  // Removed unused states as graph and submission counts are no longer displayed
  // const [totalStudents, setTotalStudents] = useState(0);
  // const [submissionCounts, setSubmissionCounts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("authToken");

  // Function to get year name based on object ID
  const getYearNameById = (yearId) => {
    switch (yearId) {
      case "680224a08cb1b3fc4af79a93":
        return "4th Year";
      case "6802249d8cb1b3fc4af79a90":
        return "3rd Year";
      case "6802249a8cb1b3fc4af79a8d":
        return "2nd Year";
      case "680224978cb1b3fc4af79a8a":
        return "1st Year";
      default:
        return "Unknown Year";
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const user = JSON.parse(jsonPayload);
        if (user && (user._id || user.id)) {
          setTeacherId(user._id || user.id);
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data && data.data) {
        setSemesters(data.data);
      } else {
        setSemesters([]);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.semester) {
      fetchSubjects(params.semester);
      // Removed fetchTotalStudents call as totalStudents state is no longer used
      // fetchTotalStudents(params.semester);
    } else {
      setSubjects([]);
      setParams((prev) => ({ ...prev, subject: "" }));
      // Removed setTotalStudents call as totalStudents state is no longer used
      // setTotalStudents(0);
    }
  }, [params.semester]);

  const fetchSubjects = async (semesterId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseApi}/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data && data.subjects) {
        setSubjects(data.subjects);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchTotalStudents function as totalStudents state is no longer used
  /*
  const fetchTotalStudents = async (semesterId) => {
    try {
      const { data } = await axios.get(`${baseApi}/students/total-count`, {
        params: { semesterId: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data && typeof data.count === "number") {
        setTotalStudents(data.count);
      } else {
        setTotalStudents(0);
      }
    } catch (error) {
      console.error("Error fetching total students:", error);
      setTotalStudents(0);
    }
  };
  */

  useEffect(() => {
    if (teacherId) {
      fetchAssignments();
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchAssignments();
    }
  }, [params.semester, params.subject]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const queryParams = { teacherId };
      if (params.semester && params.semester !== "") {
        queryParams.year = params.semester;
      }
      if (params.subject && params.subject !== "") {
        queryParams.subjectId = params.subject;
      }
      const { data } = await axios.get(`${baseApi}/assignments`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(data);

      // Removed unused submission counts and total students fetching logic
      /*
      // Extract unique years from assignments
      const uniqueYears = [...new Set(data.map(a => a.year))];

      // Initialize aggregated submission counts and total students
      let aggregatedSubmissionCounts = {};
      let aggregatedTotalStudents = 0;

      // Fetch submission counts and total students per year
      for (const year of uniqueYears) {
        // Fetch submission counts for this year
        try {
          const { data: submissionCountsData } = await axios.get(`${baseApi}/assignments/submission-counts-bulk`, {
            params: {
              teacherId,
              year,
            },
            headers: { Authorization: `Bearer ${token}` },
          });
          // Merge submission counts
          aggregatedSubmissionCounts = { ...aggregatedSubmissionCounts, ...submissionCountsData };
        } catch (error) {
          if (error.response) {
            console.error(`Error fetching submission counts for year ${year}:`, error.response.data);
          } else {
            console.error(`Error fetching submission counts for year ${year}:`, error.message);
          }
        }

        // Fetch total students for this year
        try {
          const { data: totalStudentsData } = await axios.get(`${baseApi}/students/total-count`, {
            params: { semesterId: year },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (totalStudentsData && typeof totalStudentsData.count === "number") {
            aggregatedTotalStudents += totalStudentsData.count;
          }
        } catch (error) {
          if (error.response) {
            console.error(`Error fetching total students for year ${year}:`, error.response.data);
          } else {
            console.error(`Error fetching total students for year ${year}:`, error.message);
          }
        }
      }

      setSubmissionCounts(aggregatedSubmissionCounts);
      setTotalStudents(aggregatedTotalStudents);
      */

    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
      // setSubmissionCounts({});
      // setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  };

  // Remove old fetchSubmissionCountsBulk function as logic is now integrated in fetchAssignments

  const handleSemesterChange = (e) => {
    const semesterValue = e.target.value;
    setParams((prev) => ({ ...prev, semester: semesterValue, subject: "" }));
  };

  const handleSubjectChange = (event, newValue) => {
    const subjectId = newValue ? newValue._id : "";
    setParams((prev) => ({ ...prev, subject: subjectId }));
  };

  const handleDueDateChange = (e) => {
    const dueDateValue = e.target.value;
    setParams((prev) => ({ ...prev, dueDate: dueDateValue }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!params.semester || !params.subject || !file || !teacherId) {
      alert("Please fill all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("teacherId", teacherId);
    formData.append("year", params.semester);
    formData.append("subjectId", params.subject);
    formData.append("dueDate", params.dueDate);

    setUploadLoading(true);
    try {
      await axios.post(`${baseApi}/assignments`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Assignment uploaded successfully");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setParams((prev) => ({ ...prev, dueDate: "" }));
      fetchAssignments();
    } catch (error) {
      alert(
        `Upload failed: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCardClick = async (assignmentId) => {
    console.log("handleCardClick called with assignmentId:", assignmentId);
    setModalLoading(true);
    setModalOpen(true);
    try {
      const { data } = await axios.get(`${baseApi}/assignments/student/submissions`, {
        params: { assignmentId },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Student submissions data fetched:", data);
      setSelectedAssignmentSubmissions(data);
    } catch (error) {
      setSelectedAssignmentSubmissions([]);
      console.error("Error fetching student submissions:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAssignmentSubmissions([]);
  };

  return (
    <Box sx={{ p: 5, maxWidth: "90vw", margin: "auto", minHeight: "90vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, fontWeight: "bold", textAlign: "center"}}
      >
        Assignment Upload
      </Typography>

      {/* Centered graph container */}
      {params.semester && (
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
          Year:{" "}
          {semesters.find((s) => s._id === params.semester)?.semester_text ||
            getYearNameById(params.semester)}
        </Typography>
      )}

      <Paper
        elevation={4}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 3,
          maxWidth: "90vw",
          margin: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              id="semester-select"
              name="semester"
              select
              fullWidth
              label="Year"
              value={params.semester}
              onChange={handleSemesterChange}
              disabled={loading || uploadLoading}
              InputLabelProps={{ htmlFor: "semester-select" }}
              aria-label="semester-select"
              helperText="Select the Year"
            >
              <MenuItem value="">Select Year</MenuItem>
              {semesters.map((sem) => (
                <MenuItem
                  key={sem._id}
                  value={sem._id}
                  id={`semester-option-${sem._id}`}
                >
                  {sem.semester_text} ({sem.semester_num})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              fullWidth
              options={subjects}
              getOptionLabel={(option) => option.subject_name || ""}
              value={
                params.subject === ""
                  ? null
                  : subjects.find((subj) => subj._id === params.subject) || null
              }
              onChange={(event, newValue) => {
                if (!newValue) {
                  setParams((prev) => ({ ...prev, subject: "" }));
                } else {
                  handleSubjectChange(event, newValue);
                }
              }}
              disabled={!params.semester || loading || uploadLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subject"
                  id="subject-autocomplete"
                  name="subject"
                  placeholder="Select Subject"
                  InputLabelProps={{ htmlFor: "subject-autocomplete" }}
                  helperText="Select the subject"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.subject_name}
                </li>
              )}
              ListboxProps={{
                id: "subject-listbox",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              id="due-date"
              name="dueDate"
              type="date"
              fullWidth
              label="Due Date"
              InputLabelProps={{ shrink: true, htmlFor: "due-date" }}
              value={params.dueDate}
              onChange={handleDueDateChange}
              disabled={loading || uploadLoading}
              helperText="Select the due date"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <input
              id="file-upload"
              name="file"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={loading || uploadLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 6,
                border: "1px solid #bbb",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {(() => {
              const isDisabled =
                !params.semester ||
                !params.subject ||
                !file ||
                loading ||
                uploadLoading;
              return (
                <Button
                  variant="contained"
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      return;
                    }
                    handleUpload();
                  }}
                  fullWidth
                  sx={{
                    height: 30,
                    fontSize: "1.1rem",
                    width: "25%",
                    backgroundColor: "blue !important",
                    color: "white",
                    cursor: isDisabled ? "default" : "pointer",
                    "&:hover": {
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    },
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                >
                  {uploadLoading ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              );
            })()}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 10, maxWidth: "90vw", margin: "auto" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", textAlign: "center", mb: 3, mt: 5 }}
        >
          Uploaded Assignments
        </Typography >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : assignments.length === 0 ? (
          <Typography sx={{ textAlign: "center" }}>
            No assignment has been uploaded yet.
          </Typography>
        ) : (
          assignments.map((assignment) => {
            const dueDate = assignment.dueDate
              ? new Date(assignment.dueDate)
              : null;
            const now = new Date();
            const isOnTime = dueDate ? now <= dueDate : true;

            const yearName = getYearNameById(assignment.year);

            const subjectName =
              assignment.subject && assignment.subject.subject_name
                ? assignment.subject.subject_name
                : "Unknown Subject";

            const normalizedFileUrl = assignment.fileUrl || "";
            const pathSegments = normalizedFileUrl.split(/[/\\\\]/);
            const filename =
              pathSegments.length > 0
                ? pathSegments[pathSegments.length - 1]
                : "";
            const fileUrl = filename ? `${baseApi}/assignments/file/${filename}` : null;

            return (
              <Card
                key={assignment._id}
                sx={{
                  mb: 3,
                  boxShadow: 3,
                  borderRadius: 3,
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                    cursor: "pointer",
                  },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => handleCardClick(assignment._id)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    Subject: {subjectName}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>Year: {yearName}</Typography>
                  <Typography sx={{ mb: 1 }}>
                    Due Date: {dueDate ? dueDate.toLocaleDateString() : "N/A"}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    Status:{" "}
                    <span
                      style={{
                        color: isOnTime ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {isOnTime ? "On Time" : "Overdue"}
                    </span>
                  </Typography>
                  {assignment.createdAt && (
                    <Typography sx={{ mb: 1 }}>
                      Assignment Creation Date : {new Date(assignment.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                  {fileUrl && (
                    <Typography>
                      Assignment:{" "}
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Click to view
                      </a>
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="student-submissions-modal-title"
        aria-describedby="student-submissions-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography id="student-submissions-modal-title" variant="h6" component="h2">
              Student Submissions
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {modalLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedAssignmentSubmissions.length === 0 ? (
            <Typography>No submissions found for this assignment.</Typography>
          ) : (
            <List>
              {selectedAssignmentSubmissions.map((submission) => {
                const normalizedFileUrl = submission.fileUrl || "";
                const pathSegments = normalizedFileUrl.split(/[/\\\\]/);
                const filename =
                  pathSegments.length > 0
                    ? pathSegments[pathSegments.length - 1]
                    : "";
                const fileUrl = filename ? `${baseApi}/assignments/file/${filename}` : null;

                return (
                  <ListItem key={submission._id} divider>
                    <ListItemText
                      primary={submission.student?.name || "Unknown Student"}
                      secondary={
                        fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Uploaded Assignment
                          </a>
                        ) : (
                          "No file uploaded"
                        )
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AssignmentTeacher;
