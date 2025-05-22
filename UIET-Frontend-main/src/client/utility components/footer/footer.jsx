import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        py: 2,
        bgcolor: "primary.main", // Matches Navbar
        color: "white", // White text for contrast
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        UIET - CONNECT
      </Typography>
      <Typography variant="body2">
        © 2025 UIET-Connect. All rights reserved.
      </Typography>
    </Box>
  );
}
