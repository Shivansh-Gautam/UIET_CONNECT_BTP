import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { baseApi } from "../../../environment";

const AssignmentStudent = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [doneAssignments, setDoneAssignments] = useState({}); // Track done assignments

  const token = localStorage.getItem("authToken");

  // Fetch student details to get year
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${baseApi}/student/fetch-single`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.student) {
          const student = response.data.student;
          console.log("Fetched student details:", student);
          if (student.student_class && student.student_class._id) {
            console.log("Student class _id (year):", student.student_class._id);
            setYear(student.student_class._id);
          } else {
            console.warn("student_class not found in student details");
          }
        } else {
          console.warn("Student data not found in response");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    fetchStudentDetails();
  }, [token]);


  useEffect(() => {
    if (year) {
      console.log("Fetching assignments for year:", year);
      fetchAssignments();
    }
  }, [year]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // Fetch assignments filtered by year, including done status
      const { data } = await axios.get(`${baseApi}/assignments/student`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: getYearNameById(year) },
      });
      console.log("Assignments fetched (filtered by year):", data);
      if (data.success) {
        setAssignments(data.assignments);
      } else {
        setAssignments([]);
      }

      // Initialize doneAssignments state from fetched data
      const doneStatus = {};
      (data.assignments || []).forEach(assignment => {
        if (assignment.done) {
          doneStatus[assignment._id] = true;
        }
      });
      setDoneAssignments(doneStatus);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
      setDoneAssignments({});
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event, assignmentId) => {
    console.log(`handleFileUpload called for assignmentId: ${assignmentId}`);
    const file = event.target.files[0];
    console.log('Selected file:', file);
    setSelectedFiles(prev => ({
      ...prev,
      [assignmentId]: file
    }));
  };

  const handleUploadClick = async (assignmentId) => {
    console.log(`handleUploadClick called for assignmentId: ${assignmentId}`);
    if (!selectedFiles[assignmentId]) {
      console.log('No file selected for upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFiles[assignmentId]);

    // Decode token to get studentId
    let studentId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        studentId = payload.id;
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }

    if (!studentId) {
      setUploadStatus(prev => ({
        ...prev,
        [assignmentId]: 'User not authenticated'
      }));
      return;
    }

    formData.append('studentId', studentId);
    formData.append('assignmentId', assignmentId);

    try {
      setUploadStatus(prev => ({
        ...prev,
        [assignmentId]: 'Uploading...'
      }));

      const response = await axios.post(
        `${baseApi}/assignments/student/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201 && response.data.message && response.data.message.toLowerCase().includes('success')) {
        setUploadStatus(prev => ({
          ...prev,
          [assignmentId]: 'Upload successful'
        }));
        // Mark assignment as done
        setDoneAssignments(prev => ({
          ...prev,
          [assignmentId]: true
        }));
        // Clear selected file after successful upload
        setSelectedFiles(prev => {
          const newSelected = { ...prev };
          delete newSelected[assignmentId];
          return newSelected;
        });
        // Optionally refresh assignments list or update UI accordingly
        fetchAssignments();
      } else {
        setUploadStatus(prev => ({
          ...prev,
          [assignmentId]: 'Upload failed'
        }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus(prev => ({
        ...prev,
        [assignmentId]: 'Upload error'
      }));
    }
  };

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

  return (
    <Box sx={{ p: 5, maxWidth: "90vw", margin: "auto", minHeight: "90vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        Assignments
      </Typography>
      {/* {year && (
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
          Year: {getYearNameById(year)}
        </Typography>
      )} */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Typography sx={{ textAlign: "center" }}>
          No assignments available.
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
                },
              }}
            >
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
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
                      >
                        Click to view
                      </a>
                    </Typography>
                  )}
                </Box>
                <Box sx={{ ml: 3, minWidth: 200 }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, assignment._id)}
            style={{ display: "block", marginBottom: 8 }}
            disabled={doneAssignments[assignment._id]} // Disable if done
          />
          <button
            onClick={() => handleUploadClick(assignment._id)}
            disabled={!selectedFiles[assignment._id] || doneAssignments[assignment._id]} // Disable if done
            style={{
              padding: "6px 12px",
              backgroundColor: doneAssignments[assignment._id] ? "gray" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: !selectedFiles[assignment._id] || doneAssignments[assignment._id] ? "not-allowed" : "pointer",
            }}
          >
            {doneAssignments[assignment._id] ? "Done" : "Upload"}
          </button>
          {uploadStatus[assignment._id] && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                color: uploadStatus[assignment._id].toLowerCase().includes('success') ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}
            >
              {uploadStatus[assignment._id]}
            </Typography>
          )}
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default AssignmentStudent;
