import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardHeader, Divider } from "@mui/material";
import axios from "axios";
import { baseApi } from "../../../environment.js";

export default function NoticeStudent() {
  const [notices, setNotices] = useState([]);
  const [studentYear, setStudentYear] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Fetch token inside useEffect

    const fetchStudentYear = async () => {
      try {
        const response = await axios.get(`${baseApi}/student/fetch-single`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const yearId = response.data.student?.student_class?._id || null;
        setStudentYear(yearId);
      } catch (error) {
        console.error("Error fetching student year:", error);
      }
    };

    const fetchNotices = async () => {
      try {
        const response = await axios.get(`${baseApi}/notice/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotices(response.data.data);
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };

    fetchStudentYear();
    fetchNotices();
  }, []);

  // Debug logs for notice.year and studentYear
  console.log("Student Year:", studentYear);
  notices.forEach((notice) => {
    console.log("Notice object:", notice);
  });

  // Adjust filter to handle notice.year as array or single value
  const filteredNotices = notices.filter((notice) => {
    if (!notice.year) return false; // Exclude notices without year when studentYear is set
    if (Array.isArray(notice.year)) {
      // notice.year might be array of objects or strings
      return notice.year.some((y) => {
        if (typeof y === "object" && y._id) {
          return String(y._id) === String(studentYear);
        }
        return String(y) === String(studentYear);
      });
    }
    if (typeof notice.year === "object" && notice.year._id) {
      return String(notice.year._id) === String(studentYear);
    }
    return String(notice.year) === String(studentYear);
  });

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, mt: 4 }}>
      {filteredNotices.length === 0 ? (
        <Typography variant="h6" align="center">No notice found</Typography>
      ) : (
        filteredNotices.map((notice) => (
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
  );
}
