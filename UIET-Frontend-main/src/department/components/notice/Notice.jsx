import { Box, Button, TextField, Typography, IconButton, MenuItem, Card, CardHeader, CardContent, Divider } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useFormik } from "formik";
import { noticeSchema } from "../../../yupSchema/noticeSchema";
import axios from "axios";
import { baseApi } from "../../../environment";
import { useEffect, useState } from "react";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";


export default function Notice() {
  const token = localStorage.getItem("authToken"); // Fetch token
  const [notices, setNotices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [years, setYears] = useState([]);

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${baseApi}/notice/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(response.data.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetch years response:", response);
      if (response.data && response.data.data) {
        setYears(response.data.data);
      } else {
        console.error("Unexpected response structure for years:", response.data);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchYears();
  }, []);

  const formik = useFormik({
    initialValues: { title: "", message: "", audience:"", year: "" },
    validationSchema: noticeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Sanitize year field: convert empty string to null
        const sanitizedValues = { ...values };
        if (sanitizedValues.year === "") {
          sanitizedValues.year = null;
        }
        if (editId) {
          await axios.patch(`${baseApi}/notice/update/${editId}`, sanitizedValues, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Notice updated successfully", severity: "success" });
        } else {
          await axios.post(`${baseApi}/notice/create`, sanitizedValues, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Notice added successfully", severity: "success" });
        }
        resetForm();
        setEditId(null);
        fetchNotices();
      } catch (error) {
        setAlert({ open: true, message: "Error processing request", severity: "error" });
        console.error("Error:", error);
      }
    },
  });

  const handleEdit = (notice) => {
    setEditId(notice._id);
    formik.setValues({ title: notice.title, message: notice.message, audience: notice.audience, year: notice.year || "" });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    try {
      await axios.get(`${baseApi}/notice/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, message: "Notice deleted successfully", severity: "success" });
      fetchNotices();
    } catch (error) {
      setAlert({ open: true, message: "Error deleting notice", severity: "error" });
      console.error("Error deleting notice:", error);
    }
  };

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }} onSubmit={formik.handleSubmit}>
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: 700 }}>
          {editId ? "Edit Notice" : "Add New Notice"}
        </Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          {...formik.getFieldProps("title")}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          
        />
        <TextField
          multiline
          rows={6}
          fullWidth
          label="Message"
          variant="outlined"
          {...formik.getFieldProps("message")}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={formik.touched.message && formik.errors.message}
        />
        <TextField
            select
            fullWidth
            label="Audience"
            name="audience"
            value={formik.values.audience}
            onChange={formik.handleChange}
            error={formik.touched.audience && Boolean(formik.errors.audience)}
            helperText={formik.touched.audience && formik.errors.audience}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Audience</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </TextField>

          {formik.values.audience === "student" && (
            <TextField
              select
              fullWidth
              label="Year"
              name="year"
              value={formik.values.year}
              onChange={formik.handleChange}
              error={formik.touched.year && Boolean(formik.errors.year)}
              helperText={formik.touched.year && formik.errors.year}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Select Year</MenuItem>
              {years.map((year) => (
                <MenuItem key={year._id} value={year._id}>
                  {`${year.semester_text} (${year.semester_num})`}
                </MenuItem>
              ))}
            </TextField>
          )}

        <Button fullWidth variant="contained" color="primary" type="submit">
          {editId ? "Update" : "Submit"}
        </Button>
      </Box>

      <Box component="div" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }}>
        {notices.length === 0 ? (
          <Typography variant="h6" align="center">No notice found</Typography>
        ) : (
          notices.map((notice) => (
            <Card
              key={notice._id}
              variant="outlined"
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                transition: "box-shadow 0.3s ease",
                "&:hover": { boxShadow: 6 },
                position: "relative",
              }}
            >
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: "bold" }}>{notice.title}</Typography>}
                subheader={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Audience: {notice.audience}</Typography>
                    {notice.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                }
                action={
                  <Box>
                    <IconButton color="primary" onClick={() => handleEdit(notice)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(notice._id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notice.message}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </>
  );
}
