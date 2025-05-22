import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { baseApi } from "../environment";

import { motion } from "framer-motion"; // ✨ added
import SnackbarAlert from "./snackbar/SnackbarAlert";

const Greeting = ({ role, apiEndpoint }) => {
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchUserDetails = async () => {
    if (!token) {
      setAlert({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/${apiEndpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // FIX HERE 👇
      const userData = response.data.user || response.data;
      console.log(userData);
      setUser(userData[role]);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch user details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const greetings = ["Good Morning 🌄", "Good Afternoon 🌇", "Good Evening 🌃"];
  const currentHour = new Date().getHours();
  const greetingIndex =
    currentHour >= 12 && currentHour < 17 ? 1 : currentHour >= 17 ? 2 : 0;

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      <Container maxWidth="xl" sx={{ my: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 4,
                borderRadius: 4,
                boxShadow: 6,
                background: "linear-gradient(135deg, #f9fafb, #e2e8f0)",
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ flex: "1 1 auto" }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {greetings[greetingIndex]}, {user.name} 👋
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mt: 2 }}
                  color="text.secondary"
                >
                  {`Welcome to your personalized ${role} Dashboard.`}
                </Typography>
              </CardContent>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ml: 4,
                }}
              >
                <CardMedia
                  component="img"
                  // image={`../../images/uploaded/${role}/${
                  //   user[`${role}_image`]
                  // }`}
                  image={
                    user[`${role}_image`] &&
                    user[`${role}_image`].startsWith("http")
                      ? user[`${role}_image`]
                      : `../../images/uploaded/${role}/${user[`${role}_image`]}`
                  }
                  alt="Welcome"
                  sx={{
                    width: 250,
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: 3,
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Card>
          </motion.div>
        ) : (
          <Typography variant="h6" textAlign="center" color="text.secondary">
            No user data available.
          </Typography>
        )}
      </Container>
    </>
  );
};

export default Greeting;
