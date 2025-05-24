import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  TextField,
  Toolbar,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { baseApi } from "../../../environment";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import EditIcon from "@mui/icons-material/Edit";
import SyncIcon from "@mui/icons-material/Sync";
import { styled } from "@mui/system";

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

const StudentProfile = () => {
  const token = localStorage.getItem("authToken");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAlertClose = () => setAlert({ ...alert, open: false });

  const fetchStudentDetails = useCallback(async () => {
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
      const response = await axios.get(`${baseApi}/api/student/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data.student);
      setFormData(response.data.student);
      setImagePreview(null);
    } catch (error) {
      console.error("Error fetching student details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch student details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateStudentDetails = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      for (const key in formData) {
        if (key === "department" && formData.department) {
          const dep = formData.department;
          data.append("department", typeof dep === "object" ? dep._id : dep);
        } else if (key === "student_class" && formData.student_class) {
          const cls = formData.student_class;
          data.append("student_class", typeof cls === "object" ? cls._id : cls);
        } else if (
          key === "student_image" &&
          formData.student_image instanceof File
        ) {
          data.append("image", formData.student_image); // <-- changed key to 'image' for backend
        } else {
          data.append(key, formData[key]);
        }
      }

      await axios.patch(`${baseApi}/api/student/update/${student._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAlert({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setEditing(false);
      setImagePreview(null); // Clear preview to use fresh image from backend
      fetchStudentDetails();
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const getImageUrl = (filename) =>
    filename ? `../../images/uploaded/student/${filename}` : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, student_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const idToYearMap = {
    "6808a9d279c6bb24421c5524": "2nd Year",
    "6808a9d379c6bb24421c5527": "3rd Year",
    "68239d467546b5a5586adc9f": "4th Year",
  };

  const getYearText = () => {
    const cls = student?.student_class;
    if (typeof cls === "string") return idToYearMap[cls] || "Unknown Year";
    if (typeof cls === "object") {
      if (cls._id && idToYearMap[cls._id]) return idToYearMap[cls._id];
      if (cls.semester_text) return `${cls.semester_text} Year`;
    }
    return "Unknown Year";
  };

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      {editing ? (
        <>
          <TextField
            label="Name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Age"
            name="age"
            value={formData.age || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            type="number"
          />
          <TextField
            label="Contact"
            name="student_contact"
            value={formData.student_contact || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Guardian"
            name="guardian"
            value={formData.guardian || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Guardian Phone"
            name="guardian_phone"
            value={formData.guardian_phone || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Enter new password to change it"
          />
          <TextField
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ alignSelf: "center" }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={updateStudentDetails}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            bgcolor: "#f8fafc",
            minHeight: "100vh",
            p: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {student && (
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
                  alt={student.name}
                  src={
                    student.student_image.startsWith("http")
                      ? student.student_image
                      : `/images/uploaded/student/${student.student_image}`
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
                  {student.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "white", mt: 1 }}>
                  {student.email}
                </Typography>
              </Header>
              <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: "24px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  General
                </Typography>
                <ProfileDetail label="Date of Birth" value={student.dob} />
                <ProfileDetail label="Year" value={getYearText()} />
                <ProfileDetail label="Age" value={student.age} />
                <ProfileDetail label="Roll number" value={student.rollNo} />
                <ProfileDetail label="Gender" value={student.gender} />
                <ProfileDetail
                  label="Phone Number"
                  value={student.student_contact}
                />
                <ProfileDetail label="Guardian" value={student.guardian} />
                <ProfileDetail
                  label="Guardian Number"
                  value={student.guardian_phone}
                />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SyncIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Update
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      )}
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

export default StudentProfile;
