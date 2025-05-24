import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Box,
  Typography,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { baseApi } from "../../../environment.js";

const AttendanceStudentsList = () => {
  const token = localStorage.getItem("authToken");
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [params, setParams] = useState({
    student_class: "",
    subject: "",
    search: "",
    date: "",
  });
  const [attendance, setAttendance] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [latestAttendanceRecord, setLatestAttendanceRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for stored PDFs
  const [storedPDFs, setStoredPDFs] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
    fetchStoredPDFs();
  }, []);

  useEffect(() => {
    if (params.student_class) fetchStudents();
  }, [params.student_class]);

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${baseApi}/api/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await axios.get(`${baseApi}/api/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchStoredPDFs = async () => {
    setPdfLoading(true);
    try {
      const res = await axios.get(`${baseApi}/api/attendance/pdfs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setStoredPDFs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stored PDFs:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const submitAttendance = async () => {
    if (!params.subject) {
      setSnackbar({
        open: true,
        message: "Please select a subject",
        severity: "error",
      });
      return;
    }
    if (!params.date) {
      setSnackbar({
        open: true,
        message: "Please select a date",
        severity: "error",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      console.log("Submitting attendance...");
      const attendanceDataArray = Object.entries(attendance).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );
      const response = await axios.post(
        `${baseApi}/api/attendance/mark`,
        {
          subjectId: params.subject,
          attendanceData: attendanceDataArray,
          date: params.date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Attendance submitted successfully",
          severity: "success",
        });

        // Open the attendance PDF immediately after submission
        try {
          console.log("Fetching PDF from API...");
          const pdfResponse = await axios.get(
            `${baseApi}/api/attendance/generateAttendancePDF/${params.subject}/${params.date}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob",
            }
          );
          console.log("PDF response received:", pdfResponse);
          if (pdfResponse.data.size === 0) {
            console.error("Received empty PDF blob");
            setSnackbar({
              open: true,
              message: "Received empty PDF from server",
              severity: "error",
            });
            return;
          }
          const file = new Blob([pdfResponse.data], {
            type: "application/pdf",
          });
          const fileURL = URL.createObjectURL(file);
          console.log("Created PDF blob URL:", fileURL);

          // Set latest attendance record to show card
          const subjectObj = subjects.find(
            (subj) => subj._id === params.subject
          );
          setLatestAttendanceRecord({
            subjectName: subjectObj
              ? subjectObj.subject_name
              : "Unknown Subject",
            date: params.date,
            semester:
              semesters.find((sem) => sem._id === params.student_class)
                ?.semester_num || "Unknown Year",
            pdfUrl: fileURL,
          });

          // Refresh stored PDFs list
          fetchStoredPDFs();
        } catch (pdfError) {
          console.error("Error fetching PDF after submission:", pdfError);
          setSnackbar({
            open: true,
            message: "Error fetching PDF after submission",
            severity: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "Failed to submit attendance",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error submitting attendance",
        severity: "error",
      });
      console.error("Submit attendance error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setParams((prev) => ({ ...prev, student_class: semesterId, subject: "" }));
    fetchSubjects(semesterId);
  };

  const handleSubjectChange = (event, newValue) => {
    setParams((prev) => ({ ...prev, subject: newValue ? newValue._id : "" }));
  };

  const handleDateChange = (e) => {
    setParams((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleSearch = (e) =>
    setParams((prev) => ({ ...prev, search: e.target.value }));

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${baseApi}/api/student/fetch-with-query`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students);
      // Initialize attendance state
      const initialAttendance = {};
      res.data.students.forEach((student) => {
        initialAttendance[student._id] = "Present"; // Default to Present
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAttendanceChange = (studentId, value) => {
    setAttendance((prev) => ({ ...prev, [studentId]: value }));
  };

  return (
    <Container>
      <Typography
        variant="h4"
        sx={{ textAlign: "center", mb: 4, fontWeight: "bold" }}
      >
        Student Attendance
      </Typography>
      <SnackbarAlert
        {...snackbar}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Year"
              value={params.student_class}
              onChange={handleSemesterChange}
            >
              <MenuItem value="">Select Year</MenuItem>
              {semesters.map((x) => (
                <MenuItem key={x._id} value={x._id}>
                  {x.semester_text} ({x.semester_num})
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              fullWidth
              options={subjects}
              getOptionLabel={(option) => option.subject_name || ""}
              value={
                subjects.find((subj) => subj._id === params.subject) || null
              }
              onChange={handleSubjectChange}
              renderInput={(params) => (
                <TextField {...params} label="Subject" />
              )}
            />
            <TextField
              type="date"
              fullWidth
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={params.date}
              onChange={handleDateChange}
            />
          </Box>
          <TextField
            fullWidth
            label="Search"
            value={params.search}
            onChange={handleSearch}
            placeholder="Search students..."
            sx={{ mt: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 3, borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Age
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Gender
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Guardian
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Semester
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Attendance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students
                  .filter((student) =>
                    student.name
                      .toLowerCase()
                      .includes(params.search.toLowerCase())
                  )
                  .map((student) => (
                    <TableRow
                      key={student._id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="right">{student.age}</TableCell>
                      <TableCell align="right">{student.gender}</TableCell>
                      <TableCell align="right">{student.guardian}</TableCell>
                      <TableCell align="right">
                        {student.student_class.semester_num}
                      </TableCell>
                      <TableCell align="right">
                        <label>
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="Present"
                            checked={attendance[student._id] === "Present"}
                            onChange={() =>
                              handleAttendanceChange(student._id, "Present")
                            }
                          />{" "}
                          Present
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="Absent"
                            checked={attendance[student._id] === "Absent"}
                            onChange={() =>
                              handleAttendanceChange(student._id, "Absent")
                            }
                          />{" "}
                          Absent
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={submitAttendance}
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: "4px",
            fontSize: "16px",
            padding: "10px 20px",
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </Button>
      </Box>

      {latestAttendanceRecord && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Card
            sx={{
              width: "100%",
              cursor: "pointer",
              boxShadow: 3,
              borderRadius: 3,
              padding: 2,
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 6,
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}
            onClick={() => {
              if (latestAttendanceRecord.pdfUrl) {
                window.open(latestAttendanceRecord.pdfUrl, "_blank");
              }
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {latestAttendanceRecord.subjectName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Date: {latestAttendanceRecord.date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year: {latestAttendanceRecord.semester}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* New section to display stored PDFs */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Stored Attendance PDFs
        </Typography>
        {pdfLoading ? (
          <Typography>Loading PDFs...</Typography>
        ) : storedPDFs.length === 0 ? (
          <Typography>No stored attendance PDFs found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 3, borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Subject
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Year
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    View PDF
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storedPDFs.map((pdf) => (
                  <TableRow
                    key={pdf.id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell>{pdf.subjectName}</TableCell>
                    <TableCell>
                      {new Date(pdf.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{new Date(pdf.date).getFullYear()}</TableCell>
                    <TableCell>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await axios.get(
                              `${baseApi}/api/attendance/pdf/${pdf.id}`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: "blob",
                              }
                            );
                            const file = new Blob([response.data], {
                              type: "application/pdf",
                            });
                            const fileURL = URL.createObjectURL(file);
                            window.open(fileURL, "_blank");
                          } catch (error) {
                            console.error("Error fetching PDF:", error);
                            alert("Failed to load PDF. Please try again.");
                          }
                        }}
                        variant="outlined"
                        size="small"
                      >
                        View PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default AttendanceStudentsList;
