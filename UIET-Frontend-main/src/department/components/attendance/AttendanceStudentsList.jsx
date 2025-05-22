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
} from "@mui/material";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { baseApi } from "../../../environment";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

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

  useEffect(() => {
    fetchSemesters();
  }, []);
  useEffect(() => {
    if (params.student_class) fetchStudents();
  }, [params]);

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await axios.get(`${baseApi}/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
      const res = await axios.get(`${baseApi}/student/fetch-with-query`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students);
      // Initialize attendance state
      const initialAttendance = {};
      res.data.students.forEach((student) => {
        initialAttendance[student._id] = "present"; // Default to present
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAttendanceChange = (studentId, value) => {
    setAttendance((prev) => ({ ...prev, [studentId]: value }));
  };

  const calculateAttendanceData = () => {
    const presentCount = Object.values(attendance).filter(
      (status) => status === "present"
    ).length;
    const absentCount = Object.values(attendance).filter(
      (status) => status === "absent"
    ).length;
    return [
      { name: "Present", value: presentCount },
      { name: "Absent", value: absentCount },
    ];
  };

  const attendanceData = calculateAttendanceData();

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
                            value="present"
                            checked={attendance[student._id] === "present"}
                            onChange={() =>
                              handleAttendanceChange(student._id, "present")
                            }
                          />{" "}
                          Present
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="absent"
                            checked={attendance[student._id] === "absent"}
                            onChange={() =>
                              handleAttendanceChange(student._id, "absent")
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
        <button
          onClick={async () => {
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
              const attendanceDataArray = Object.entries(attendance).map(
                ([studentId, status]) => ({
                  studentId,
                  status,
                })
              );
              const response = await axios.post(
                `${baseApi}/attendance/mark`,
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
            }
          }}
          style={{
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Submit Attendance
        </button>
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Box>
          <PieChart width={600} height={600}>
            <Pie
              data={attendanceData}
              cx={300}
              cy={300}
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {attendanceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#82ca9d" : "#ff6666"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
          Attendance Overview for {params.date || "Select Date"}
        </Typography>
      </Box>
    </Container>
  );
};

export default AttendanceStudentsList;
