import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import img1 from "../../../assets/teacher_in_classroom.jpeg";
import img2 from "../../../assets/teacher_smiling.jpeg";


const HomeAbout = () => {
  return (
    <Box sx={{ bgcolor: "white", py: 6, px: 4, minHeight: "100vh" }}>
      <Grid container spacing={6} alignItems="center" justifyContent="center">
        {/* Left Content */}
        <Grid item xs={12} md={6}>
          <Chip
            label="About UIET-Connect"
            variant="outlined"
            color="primary"
            sx={{ mb: 2, fontSize: "1rem", borderRadius: "50px", px: 2, py: 1 }}
          />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Revolutionize Your Educational Experience with{" "}
            <Typography component="span" color="primary">
              UIET-Connect Web Platform.
            </Typography>
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Seamlessly connect students, teachers, and admins on our modern
            platform designed to facilitate effective academic interactions and
            management. Access attendance records, download notes, manage
            assignments, and communicate efficiently.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForward />}
            sx={{
              mt: 2,
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
            }}
          >
            Get Started
          </Button>
        </Grid>

        {/* Right Side - Image Cards */}
        <Grid item xs={12} md={6} container spacing={3}>
          {/* Student Features Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{ position: "relative", borderRadius: "20px", boxShadow: 3 }}
            >
              <CardMedia
                component="img"
                height="250"
                image={img1}
                alt="A Teacher standing in front of a classroom"
              />
              <Chip
                label="Student Features"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: "white",
                  color: "black",
                  fontWeight: "bold",
                }}
              />
              <CardContent
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  borderRadius: "0 0 20px 20px",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Empower Your Learning
                </Typography>
                <Typography variant="body2">
                  View attendance records, download essential notes, submit
                  assignments, and provide feedback to shape your educational
                  journey.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Teacher Features Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{ position: "relative", borderRadius: "20px", boxShadow: 3 }}
            >
              <CardMedia
                component="img"
                height="250"
                image={img2}
                alt="A teacher smiling in a classroom"
              />
              <Chip
                label="Teacher Features"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: "white",
                  color: "black",
                  fontWeight: "bold",
                }}
              />
              <CardContent
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  borderRadius: "0 0 20px 20px",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Manage Your Class Effectively
                </Typography>
                <Typography variant="body2">
                  Mark attendance, upload notes, assign grades, and communicate
                  with your students through streamlined features.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeAbout;
