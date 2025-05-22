import React from "react";
import { Snackbar, Alert, Slide, Box } from "@mui/material";

const SnackbarAlert = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={Slide}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{
            minWidth: "250px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
            fontSize: "1rem",
          }}
        >
          {message}
        </Alert>
      </Box>
    </Snackbar>
  );
};

export default SnackbarAlert;
