import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import { ArrowForward, Phone } from "@mui/icons-material";
import img1 from "../../../assets/Teacher holding a tablet.jpeg"; // Ensure this path is correct

const HeroSection = () => {
  return (
    <Box
      sx={{
        bgcolor: "#EEEEED",
        p: 4,
        borderRadius: "50px",margin:"40px",
        minHeight: "100vh",
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        spacing={4}
      >
        {/* Left Content */}
        <Grid item xs={12} md={6} sx={{ maxWidth: "600px", mx: "auto" }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            <span>Enhancing  </span>
            <Typography component="span" variant="h3" color="primary">
              Learning{" "}
            </Typography>
            <span>Through UIET-Connect</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            UIET-Connect is designed to facilitate effective collaboration
            between students, teachers, and administrators. Our platform’s
            features streamline academic management, enhance user interactions,
            and foster a supportive educational environment that tailors to the
            unique needs of each user role.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Phone />}
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: "50px",
              px: 3,
              py: 1.5,
              mt: 2,
              "&:hover": { bgcolor: "primary.dark" }, // Added hover effect
            }}
          >
            Discover More About Us
          </Button>
        </Grid>

        {/* Right Image Section */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ position: "relative", maxWidth: "600px", mx: "auto" }}
        >
          <Box
            component="img"
            src={img1}
            alt="Teacher holding a tablet"
            sx={{ width: "100%", borderRadius: 3, boxShadow: 3 }}
          />
          {/* Floating Card */}
          <Paper
            elevation={6} // Enhanced shadow effect
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              borderRadius: 3,
              p: 2,
              maxWidth: "90%",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Explore Our Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Uncover the dynamic features available for students, teachers,
                and admins, all designed to create an efficient and engaging
                educational experience.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: "50px",
                  "&:hover": { bgcolor: "primary.dark" },
                }} // Added hover effect
              >
                View Features
              </Button>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection;
