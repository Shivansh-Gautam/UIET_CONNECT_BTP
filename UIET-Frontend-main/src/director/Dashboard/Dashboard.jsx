import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Toolbar,
  styled,
} from "@mui/material";
import axios from "axios";

import { baseApi } from "../../environment";
import SnackbarAlert from "../../basic utility components/snackbar/SnackbarAlert";

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: "#4b4f9c",
  position: "relative",
  overflow: "hidden",
  borderRadius: "0 0 24px 24px",
  padding: theme.spacing(3),
  textAlign: "center",
}));

const BackgroundImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: -1,
});

const Dashboard = () => {
  const token = localStorage.getItem("authToken");

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    else if (hour < 18) return "Afternoon";
    else return "Evening";
  };

  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchDirectorDetails = useCallback(async () => {
    if (!token) {
      setAlert({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/api/director/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched teacher data:", response.data.teacher);
      setDirector(response.data.teacher);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch teacher details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token, setAlert, setLoading, setDirector]);

  useEffect(() => {
    fetchDirectorDetails();
  }, [fetchDirectorDetails]);

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      {/* Welcome message snippet inserted at top */}
      <Box
        sx={{
          backgroundColor: "#e3eaf3",
          borderRadius: 3,
          p: 3,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {`Good ${getTimeOfDay()} 🏢, ${
              director?.name ? ` ${director.name}` : "Loading..."
            }`}{" "}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome to your personalized Director Dashboard.
          </Typography>
        </Box>
        {director && (
          <Box>
            <img
              src={
                director.teacher_image.startsWith("http")
                  ? director.teacher_image
                  : `/images/uploaded/student/${director.teacher_image}`
              }
              alt="Welcome"
              style={{
                width: 150,
                height: "auto",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: "#f8fafc",
          minHeight: "100vh",
          p: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {director && (
          <Box sx={{ maxWidth: 800, width: "100%" }}>
            <Header>
              <BackgroundImage
                src="https://storage.googleapis.com/a1aa/image/3663d737-88d7-4ef0-7bcd-9c4977a3d038.jpg"
                alt="Background"
              />
              <Toolbar>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ flexGrow: 1, color: "white", fontWeight: "bold" }}
                >
                  Profile
                </Typography>
              </Toolbar>

              <Avatar
                alt={director.name}
                src={
                  director.teacher_image.startsWith("http")
                    ? director.teacher_image
                    : `/images/uploaded/student/${director.teacher_image}`
                }
                sx={{
                  width: 128,
                  height: 128,
                  border: "4px solid #def0f0",
                  margin: "16px auto",
                }}
              />

              <Typography
                variant="h5"
                component="h2"
                sx={{ color: "white", fontWeight: "bold", mt: 2 }}
              >
                {director.name}
              </Typography>
              <Typography variant="body1" sx={{ color: "white", mt: 1 }}>
                {director.email}
              </Typography>
            </Header>
            <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: "24px" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                General
              </Typography>
              <ProfileDetail label="Date of Birth" value={director.dob} />
              <ProfileDetail label="Age" value={director.age} />
              <ProfileDetail
                label="Qualification"
                value={director.qualification}
              />
              <ProfileDetail label="Gender" value={director.gender} />
              <ProfileDetail
                label="Phone Number"
                value={director.teacher_contact}
              />
            </Paper>
          </Box>
        )}
      </Box>
    </>
  );
};

const ProfileDetail = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: "gray" }}>
      {value}
    </Typography>
  </Box>
);

export default Dashboard;
