import { useState, useEffect } from "react";
import { Container, TextField, Box, Typography, Grid, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Autocomplete } from "@mui/material";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { baseApi } from "../../../environment.js";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AttendanceStudent = () => {
  const token = localStorage.getItem("authToken");
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [params, setParams] = useState({
    subject: '',
    date: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    // Extract student ID from token when component mounts
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setStudentId(payload.id);
    }
  }, [token]);

  useEffect(() => {
    // Fetch subjects directly for the logged-in user
    if (studentId) {
      fetchStudentSubjects();
      fetchAttendance();
    }
  }, [studentId]);

  useEffect(() => {
    // Fetch attendance when subject or date changes
    if (studentId) {
      fetchAttendance();
    }
  }, [params.subject, params.date, studentId]);

  const fetchStudentSubjects = async () => {
    try {
      // Get student's semester/class from their profile or another endpoint
      const profileRes = await axios.get(`${baseApi}/student/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (profileRes.data.success && profileRes.data.student && profileRes.data.student.student_class) {
        const studentClass = profileRes.data.student.student_class;
        
        // Fetch subjects for the student's class
        const res = await axios.get(`${baseApi}/subject/fetch-with-query`, {
          params: { student_class: studentClass },
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setSubjects(res.data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch subjects. Please try again.",
        severity: "error"
      });
    }
  };

  const fetchAttendance = async () => {
    try {
      if (!studentId) return;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.subject) queryParams.append('subject', params.subject);
      if (params.date) queryParams.append('date', params.date);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const res = await axios.get(`${baseApi}/attendance/student/${studentId}${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        console.log("Attendance data fetched:", res.data.data);
        // Filter attendance records by subject and date if selected
        let filteredData = res.data.data;
        if (params.subject) {
          filteredData = filteredData.filter(record => record.subjectName === subjects.find(s => s._id === params.subject)?.subject_name);
        }
        if (params.date) {
          filteredData = filteredData.filter(record => new Date(record.date).toISOString().split('T')[0] === params.date);
        }
        setAttendanceRecords(filteredData);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to fetch attendance data",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setSnackbar({
        open: true,
        message: "Error loading attendance data",
        severity: "error"
      });
    }
  };

  const calculateAttendanceData = () => {
    const presentCount = attendanceRecords.filter(record => record.status.toLowerCase() === 'present').length;
    const absentCount = attendanceRecords.filter(record => record.status.toLowerCase() === 'absent').length;
    
    return [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount }
    ];
  };

  const attendanceData = calculateAttendanceData();
  const totalClasses = attendanceRecords.length;
  const presentPercentage = totalClasses > 0 
    ? ((attendanceData[0].value / totalClasses) * 100).toFixed(1) 
    : 0;

  return (
    <Container>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 4, fontWeight: "bold" }}>My Attendance</Typography>
      <SnackbarAlert {...snackbar} onClose={() => setSnackbar({ ...snackbar, open: false })} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <Autocomplete
              fullWidth
              options={subjects}
              getOptionLabel={(option) => option.subject_name || ""}
              value={subjects.find((subj) => subj._id === params.subject) || null}
              onChange={(event, newValue) => setParams(prev => ({ ...prev, subject: newValue ? newValue._id : '' }))}
              renderInput={(params) => <TextField {...params} label="Subject" />}
            />
            <TextField
              type="date"
              fullWidth
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={params.date}
              onChange={(e) => setParams(prev => ({ ...prev, date: e.target.value }))}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6">Overall Attendance: {presentPercentage}%</Typography>
            <Typography>
              Present: {attendanceData[0].value} | Absent: {attendanceData[1].value} | Total Classes: {totalClasses}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subject</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Year</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, index) => (
                    <TableRow 
                      key={record._id ? record._id : `attendance-${index}`} 
                      sx={{ 
                        "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                        backgroundColor: record.status.toLowerCase() === 'present' ? 'rgba(130, 202, 157, 0.1)' : 'rgba(255, 102, 102, 0.1)'
                      }}
                    >
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.subjectName}</TableCell>
                      <TableCell>{new Date(record.date).getFullYear()}</TableCell>
                      <TableCell 
                        sx={{ 
                          color: record.status.toLowerCase() === 'present' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {record.status}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No attendance records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {attendanceRecords.length > 0 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <PieChart width={400} height={400}>
            <Pie
              data={attendanceData}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#82ca9d" : "#ff6666"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </Box>
      )}
    </Container>
  );
};

export default AttendanceStudent;