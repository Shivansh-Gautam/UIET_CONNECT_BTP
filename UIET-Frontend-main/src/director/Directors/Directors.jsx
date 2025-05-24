import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { baseApi } from "../../environment";

const departmentNameMap = {
  "6800c64265d452d6a4b75ea1": "CSE",
  "6808926ca16927caec076318": "IT",
  "680c04d4d12802cc0718055f": "ECE",
  "680c981405b8a4ad5775a38c": "MEE",
  "680ca1f505b8a4ad5775a424": "CHE",
};

const Directors = () => {
  const token = localStorage.getItem("authToken");
  const [teachers, setTeachers] = useState([]);
  const [heads, setHeads] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Removed unused fetchTeachers function

  const fetchAllTeachers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseApi}/api/teacher/fetch-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Failed to fetch all teachers", error);
      setError("Failed to fetch teachers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch selected director for logged-in user
  const fetchSelectedDirector = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${baseApi}/api/director/teacher/selected-director`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.selectedDirector) {
        const selectedDirectorId = response.data.selectedDirector._id;
        // Check if selectedDirectorId exists in teachers list
        const existsInTeachers = teachers.some(
          (teacher) => teacher._id === selectedDirectorId
        );
        if (existsInTeachers) {
          setHeads({ [selectedDirectorId]: true });
          localStorage.setItem(
            "selectedHeads",
            JSON.stringify({ [selectedDirectorId]: true })
          );
        } else {
          // If not in teachers list, clear selection
          setHeads({});
          localStorage.setItem("selectedHeads", JSON.stringify({}));
        }
      } else {
        setHeads({});
        localStorage.setItem("selectedHeads", JSON.stringify({}));
      }
    } catch (error) {
      console.error("Failed to fetch selected director", error);
    }
  };

  useEffect(() => {
    // On component mount, load selected heads from localStorage
    const savedHeads = localStorage.getItem("selectedHeads");
    if (savedHeads) {
      try {
        const parsedHeads = JSON.parse(savedHeads);
        setHeads(parsedHeads);
      } catch (e) {
        console.error("Failed to parse saved heads from localStorage", e);
      }
    }
    fetchAllTeachers();
    fetchSelectedDirector();
  }, []);

  // Removed redundant fetchTeachers useEffect to prevent overwriting teachers state
  // useEffect(() => {
  //   fetchTeachers();
  // }, []);

  useEffect(() => {
    // Save heads state to localStorage whenever it changes
    localStorage.setItem("selectedHeads", JSON.stringify(heads));
  }, [heads]);

  const handleCheckboxChange = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      // Determine if selecting or deselecting
      const isSelecting = !heads[id];

      // Save previous state to revert if API call fails
      const previousHeads = { ...heads };

      // Optimistically update local state before API call
      setHeads(() => {
        const newHeads = {};
        if (!isSelecting) {
          // Deselecting the currently selected director, enable all checkboxes
          return newHeads;
        } else {
          // Selecting a director, disable all others
          newHeads[id] = true;
          return newHeads;
        }
      });

      // Call backend API to create or update director from teacher selection
      const response = await axios.post(
        `${baseApi}/api/director/create-or-update-from-teacher`,
        { teacherId: id, isActive: isSelecting },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API response:", response.data);

      if (!response.data.success) {
        // Revert state if API call fails
        setHeads(previousHeads);
        throw new Error(response.data.message || "Failed to update director");
      }
    } catch (error) {
      console.error("Failed to update director info:", error);
      alert("Failed to update director info: " + error.message);
    }
  };

  const headsList = teachers.filter((t) => heads[t._id]);

  // Group teachers by department
  const groupedByDepartment = teachers.reduce((acc, teacher) => {
    let dept = teacher.department || "Unknown Department";
    dept = departmentNameMap[dept] || dept;
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(teacher);
    return acc;
  }, {});

  return (
    <Box sx={{ display: "flex", gap: 4, p: 2, flexWrap: "wrap" }}>
      <Box sx={{ flex: 1, minWidth: 300 }}>
        <Typography variant="h4" gutterBottom>
          Select the Director
        </Typography>
        <Box sx={{ mb: 2 }}>
          {/* <button onClick={fetchSelectedDirector}>Refresh Selected Directors</button> */}
        </Box>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading &&
          !error &&
          Object.entries(groupedByDepartment).map(
            ([department, deptTeachers]) => (
              <Card key={department} sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {department}
                </Typography>
                <Grid container spacing={2}>
                  {deptTeachers.map((teacher) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={teacher._id}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleCheckboxChange(teacher._id)}
                    >
                      <Card
                        variant={heads[teacher._id] ? "outlined" : "elevation"}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 1,
                          borderColor: heads[teacher._id]
                            ? "primary.main"
                            : "transparent",
                          boxShadow: heads[teacher._id] ? 3 : 1,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: 6,
                          },
                        }}
                      >
                        <Checkbox
                          checked={!!heads[teacher._id]}
                          disabled={
                            Object.keys(heads).length > 0 && !heads[teacher._id]
                          }
                          onChange={() => handleCheckboxChange(teacher._id)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ mr: 2 }}
                        />
                        <Avatar
                          src={teacher.director_image || ""}
                          alt={teacher.name}
                          sx={{ width: 48, height: 48, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {teacher.name}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            )
          )}
      </Box>
      <Box sx={{ width: 300, minWidth: 280 }}>
        <Typography variant="h5" gutterBottom>
          Selected Director
        </Typography>
        {headsList.length === 0 ? (
          <Typography>No heads selected</Typography>
        ) : (
          headsList.map((head) => (
            <Card key={head._id} sx={{ mb: 2 }}>
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {head.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 80 }}
                  >
                    Email:
                  </Typography>
                  <Typography variant="body2">{head.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 80 }}
                  >
                    Age:
                  </Typography>
                  <Typography variant="body2">{head.age}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 80 }}
                  >
                    Gender:
                  </Typography>
                  <Typography variant="body2">{head.gender}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 80 }}
                  >
                    Qualification:
                  </Typography>
                  <Typography variant="body2">{head.qualification}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 80 }}
                  >
                    Department:
                  </Typography>
                  <Typography variant="body2">
                    {departmentNameMap[head.department] || head.department}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Directors;
