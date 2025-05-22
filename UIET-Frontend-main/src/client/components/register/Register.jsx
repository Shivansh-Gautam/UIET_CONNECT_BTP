import { useState, useEffect } from "react";
import backgroundImage from "../../../assets/Teacher_on_podium.jpeg";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material"; // Removed Paper import
import { Visibility, VisibilityOff, CloudUpload } from "@mui/icons-material";
import { useFormik } from "formik";
import { registerSchema } from "../../../yupSchema/registerSchema";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Register = () => {
  const [image, setImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formik = useFormik({
    initialValues: {
      department_name: "",
      email: "",
      hod_name: "", 
      password: "",
      confirm_password: "",
      passcode:"",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      if (!image) {
        setSnackbar({
          open: true,
          message: "Please upload an image before registering.",
          severity: "warning",
        });
        return;
      }

      const fd = new FormData();
      fd.append("image", image, image.name);
      fd.append("department_name", values.department_name);
      fd.append("hod_name", values.hod_name);
      fd.append("password", values.password);
      fd.append("email", values.email);

      try {
        await axios.post(`${API_BASE_URL}/api/department/register`, fd);
        setSnackbar({
          open: true,
          message: "Registered Successfully!",
          severity: "success",
        });
        formik.resetForm();
        setImage(null);
      } catch (e) {
        setSnackbar({
          open: true,
          message:
            e.response?.data?.message || "Registration failed. Try again.",
          severity: "error",
        });
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        marginTop: "30px",
        marginBottom: "30px",
        borderRadius: "40px",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        display="flex"
        borderRadius={6}
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="center"
        width="100%"
        p={2}
      >
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          p={5}
          bgcolor="rgba(0, 0, 0, 0.5)"
          borderRadius={6}
          sx={{
            backgroundColor: "black",
            opacity: "70%",
            height: "400px",
            color: "white",
          }}
        >
          <Typography variant="subtitle1" color="primary" gutterBottom>
            UNLOCK YOUR ACADEMIC POTENTIAL
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            Register Your Department
          </Typography>
          <Typography variant="body1">
            Access your personalized student dashboard, manage your academic
            profile, and stay updated with important notices.
          </Typography>
        </Box>
        <Box
          flex={1}
          p={4}
          borderRadius={6}
          boxShadow={18}
          sx={{ backgroundColor: "white" }}
          mt={{ xs: 4, md: 0 }}
          ml={{ md: 4 }}
        >
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            onSubmit={formik.handleSubmit}
          >
            <Box sx={{ textAlign: "center" }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-image"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="upload-image">
                <Button
                  component="span"
                  variant="contained"
                  startIcon={<CloudUpload />}
                >
                  Upload Image
                </Button>
              </label>
              {image && (
                <Avatar
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  sx={{ width: 100, height: 100, margin: "10px auto" }}
                />
              )}
            </Box>
            <TextField
              fullWidth
              label="Department Name"
              variant="outlined"
              {...formik.getFieldProps("department_name")}
              error={
                formik.touched.department_name &&
                Boolean(formik.errors.department_name)
              }
              helperText={
                formik.touched.department_name && formik.errors?.department_name
              }
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors?.email}
              inputProps={{ autoComplete: "email" }}
            />
            <TextField
              fullWidth
              label="Head of Department"
              variant="outlined"
              {...formik.getFieldProps("hod_name")}
              error={formik.touched.hod_name && Boolean(formik.errors.hod_name)}
              helperText={formik.touched.hod_name && formik.errors?.hod_name}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              {...formik.getFieldProps("password")}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors?.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: "new-password" }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              {...formik.getFieldProps("confirm_password")}
              error={
                formik.touched.confirm_password &&
                Boolean(formik.errors.confirm_password)
              }
              helperText={
                formik.touched.confirm_password &&
                formik.errors?.confirm_password
              }
              inputProps={{ autoComplete: "new-password" }}
            />
            <TextField
              fullWidth
              label="Enter Passcode to Register"
              variant="outlined"
              {...formik.getFieldProps("passcode")}
              error={formik.touched.passcode && Boolean(formik.errors.passcode)}
              helperText={formik.touched.passcode && formik.errors?.passcode}
            />
            <Button fullWidth variant="contained" color="primary" type="submit">
              Register
            </Button>
          </Box>
          <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
