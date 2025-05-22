import axios from "axios";
import { useEffect, useState } from "react";
import { baseApi } from "../../../environment";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { CloudUpload } from "@mui/icons-material";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert"; // Import SnackbarAlert

export default function Dashboard() {
  const [department, setDepartment] = useState(null);
  const [edit, setEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [departmentName, setDepartmentName] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Severity (success/error)

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleEditSubmit = () => {
    const fd = new FormData();
    fd.append("department_name", departmentName);
    if (image) {
      fd.append("image", image, image.name);
    }

    axios
      .patch(`${baseApi}/department/update`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      .then((resp) => {
        console.log("Department edited", resp);
        setDepartment((prevDept) => ({
          ...prevDept,
          department_name: departmentName,
          department_image: resp.data.department.department_image,
        }));
        setEdit(false); // Exit edit mode

        // Trigger Snackbar on success
        setSnackbarMessage("Department updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((e) => {
        console.log("Error editing department", e);
        // Trigger Snackbar on error
        setSnackbarMessage("Error updating department.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setImage(null);
  };

  const fetchDepartment = () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      axios
        .get(`${baseApi}/department/fetch-single`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((resp) => {
          console.log("Fetched department", resp);
          setDepartment(resp.data.department);
          setDepartmentName(resp.data.department.department_name);
        })
        .catch((e) => {
          console.log("Error fetching department", e);
        });
    } else {
      console.log("No token found");
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return (
    <>
      {edit && (
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          noValidate
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
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleEditSubmit}
          >
            Submit Edit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ marginBottom: "20px" }}
            onClick={cancelEdit}
          >
            Cancel
          </Button>
        </Box>
      )}

      {department && (
        <Box
          sx={{
            position: "relative",
            borderRadius: "40px",
            // border: "4px solid",
            height: "400%",
            width: "100%",
            background: `url(${
              department.department_image
                ? department.department_image
                : "/images/default-image.jpg"
            })`,
            backgroundSize: "cover",
            filter: "blur(0.5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              background: "black",
              padding: "8px",
              opacity: "75%",
              borderRadius: "30px",
            }}
          >
            {department.department_name}
          </Typography>
          <Box
            component="div"
            sx={{ position: "absolute", bottom: "10px", right: "10px" }}
          >
            <Button
              variant="outlined"
              sx={{
                background: "white",
                borderRadius: "50%",
                height: "60px",
                color: "black",
              }}
              onClick={() => setEdit(true)}
            >
              <ModeEditOutlineIcon />
            </Button>
          </Box>
        </Box>
      )}

      {/* SnackbarAlert Component */}
      <SnackbarAlert
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
