import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  Box,
  InputAdornment,
  IconButton,
  MenuItem,
  CardMedia,
  CardContent,
  Card,
  CardActions,
} from "@mui/material";
import { Visibility, VisibilityOff, CloudUpload } from "@mui/icons-material";
import { useFormik } from "formik";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { teacherSchema } from "../../../yupSchema/teacherSchema";
import { baseApi } from "../../../environment";
import { teacherEditSchema } from "../../../yupSchema/teacherSchema";

const Teachers = () => {
  const token = localStorage.getItem("authToken");
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [image, setImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // Removed unused semesters state to fix ESLint warning
  // const [semesters, setSemesters] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Commented out fetchSemesters function since it is unused
  // const fetchSemesters = useCallback(async () => {
  //   if (!token) {
  //     setSnackbar({
  //       open: true,
  //       message: "Authorization token missing",
  //       severity: "error",
  //     });
  //     return;
  //   }
  //   try {
  //     const response = await axios.get(`${baseApi}/semester/all`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setSemesters(response.data.data);
  //   } catch (error) {
  //     console.error("Error fetching semesters:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to fetch semesters",
  //       severity: "error",
  //     });
  //   }
  // });

  const [params, setParams] = useState({});

  const handleSearch = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: e.target.value || undefined,
    }));
  };

  const handleEdit = (id) => {
    setEdit(true);
    setEditId(id);
    const teacher = teachers.find((x) => x._id === id);
    formik.setValues({
      name: teacher.name,
      email: teacher.email,
      gender: teacher.gender,
      teacher_contact: teacher.teacher_contact,
      dob: teacher.dob,
      age: teacher.age,
      qualification: teacher.qualification,
      password: "",
      confirm_password: "",
    });
  };

  const handleDelete = async (teacherId) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      await axios.delete(`${baseApi}/teacher/delete/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Teacher deleted successfully!",
        severity: "success",
      });
      fetchTeachers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete teacher",
        severity: "error",
        error,
      });
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    setEdit(false);
  };

  const [teachers, setTeachers] = useState([]);

  const fetchTeachers = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      const response = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch teachers",
        severity: "error",
      });
    }
  };
  // Removed useEffect for fetchSemesters since function is removed
  // useEffect(() => {
  //   fetchSemesters();
  // }, [fetchSemesters]);
  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add useEffect to refetch teachers when params change (e.g., search)
  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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
      name: "",
      email: "",
      gender: "",
      teacher_contact: "",
      dob: "",
      age: "",
      qualification: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: edit ? teacherEditSchema : teacherSchema,
    onSubmit: async (values) => {
      if (!edit && !image) {
        // Only check for image on new registration
        setSnackbar({
          open: true,
          message: "Please upload an image before registering.",
          severity: "warning",
        });
        return;
      }
      if (!token) {
        setSnackbar({
          open: true,
          message: "Authorization token missing",
          severity: "error",
        });
        return;
      }

      const fd = new FormData();
      if (image) fd.append("image", image, image.name); // Only append image if present
      Object.keys(values).forEach((key) => fd.append(key, values[key]));

      try {
        if (edit) {
          await axios.patch(`${baseApi}/teacher/update/${editId}`, fd, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSnackbar({
            open: true,
            message: "Teacher updated successfully!",
            severity: "success",
          });
        } else {
          await axios.post(`${baseApi}/teacher/register`, fd, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSnackbar({
            open: true,
            message: "Registered Successfully!",
            severity: "success",
          });
        }
        formik.resetForm();
        setEdit(false);
        setImage(null);
        fetchTeachers();
      } catch (e) {
        setSnackbar({
          open: true,
          message: e.response?.data?.message || "Operation failed.",
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
    <>
      <Container
        maxWidth="sm"
        sx={{ mt: 8, mb: 8, p: 4, borderRadius: 4, boxShadow: 9 }}
      >
        {edit ? (
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center", mb: 4, fontWeight: "bold" }}
          >
            Edit Teacher
          </Typography>
        ) : (
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center", mb: 4, fontWeight: "bold" }}
          >
            Add New Teacher
          </Typography>
        )}
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
            label="Name"
            variant="outlined"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors?.name}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            {...formik.getFieldProps("email")}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors?.email}
          />
          <TextField
            select
            fullWidth
            label="Gender"
            variant="outlined"
            {...formik.getFieldProps("gender")}
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            helperText={formik.touched.gender && formik.errors?.gender}
          >
            {["Male", "Female", "Other"].map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Age"
            variant="outlined"
            {...formik.getFieldProps("age")}
            error={formik.touched.age && Boolean(formik.errors.age)}
            helperText={formik.touched.age && formik.errors?.age}
          />
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            {...formik.getFieldProps("dob")}
            error={formik.touched.dob && Boolean(formik.errors.dob)}
            helperText={formik.touched.dob && formik.errors.dob}
          />
          <TextField
            fullWidth
            label="Contact Number"
            variant="outlined"
            {...formik.getFieldProps("teacher_contact")}
            error={
              formik.touched.teacher_contact &&
              Boolean(formik.errors.teacher_contact)
            }
            helperText={
              formik.touched.teacher_contact && formik.errors?.teacher_contact
            }
          />

          <TextField
            fullWidth
            label="Qualification"
            variant="outlined"
            {...formik.getFieldProps("qualification")}
            error={
              formik.touched.qualification &&
              Boolean(formik.errors.qualification)
            }
            helperText={
              formik.touched.qualification && formik.errors?.qualification
            }
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
              formik.touched.confirm_password && formik.errors?.confirm_password
            }
          />
          <Box sx={{ textAlign: "center" }}>
            {edit ? (
              <Button
                sx={{ width: "120px", margin: "5px" }}
                variant="contained"
                color="primary"
                type="submit"
              >
                Update
              </Button>
            ) : (
              <Button
                sx={{ width: "120px", margin: "5px" }}
                variant="contained"
                color="primary"
                type="submit"
              >
                Register
              </Button>
            )}
            {edit && (
              <Button
                sx={{ width: "120px", margin: "5px", background: "red" }}
                variant="contained"
                type="button"
                onClick={() => {
                  handleCancel();
                }}
              >
                cancel
              </Button>
            )}
          </Box>
        </Box>
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </Container>

      <Box
        component={"div"}
        sx={{ display: "flex", flexDirection: "row", gap: "10px" }}
      >
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={params.search ? params.search : ""}
          onChange={(e) => {
            handleSearch(e);
          }}
        />
      </Box>
      <Box
        component="div"
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
          marginTop: "40px",
        }}
      >
        {teachers &&
          teachers.map((teacher) => (
            <Card
              key={teacher._id}
              sx={{
                height: 550,
                boxShadow: 4,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardMedia
                component="img"
                sx={{ height: 280, objectFit: "cover" }}
                image={teacher.teacher_image}
                alt="Teacher Image"
              />
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 1,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <strong>Name:</strong> {teacher.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Email:</strong> {teacher.email}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Age:</strong> {teacher.age}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Date of Birth:</strong> {teacher.dob}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Contact No:</strong> {teacher.teacher_contact}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Gender:</strong> {teacher.gender}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Qualification:</strong> {teacher.qualification}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", padding: 1 }}>
                <IconButton
                  color="primary"
                  onClick={() => {
                    handleEdit(teacher._id);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    handleDelete(teacher._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
      </Box>
    </>
  );
};

export default Teachers;
