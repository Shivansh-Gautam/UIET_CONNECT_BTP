import { useEffect, useState, useContext } from "react";
import { Box, Typography, Card, CardContent, CardHeader, Divider, CircularProgress, Alert, Button } from "@mui/material";
import axios from "axios";
import { baseApi } from "../../../environment";
import { AuthContext } from "../../../context/AuthContext";

export default function NoticeTeacher() {
  const { logout, user } = useContext(AuthContext);
  const token = localStorage.getItem("authToken");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to handle axios errors, logout on 401
  const handleAxiosError = (error) => {
    if (error.response && error.response.status === 401) {
      alert("Session expired or unauthorized. Please login again.");
      logout();
    } else {
      console.error(error);
      setError(error.message || "An error occurred");
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminResponse, directorResponse] = await Promise.all([
        axios.get(`${baseApi}/notice/teacher`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseApi}/directorNotice/recipient`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const adminNotices = adminResponse.data.data || [];
      let directorNotices = directorResponse.data.data || [];
      // Filter director notices where recipientName or recipientNames include logged-in user's name (case-insensitive)
      directorNotices = directorNotices.filter((notice) => {
        if (!notice.recipientName && !notice.recipientNames) return false;
        const userNameLower = (user?.name || "").toLowerCase();
        if (notice.recipientName && typeof notice.recipientName === 'string') {
          if (notice.recipientName.toLowerCase().includes(userNameLower)) {
            return true;
          }
        }
        if (notice.recipientNames && Array.isArray(notice.recipientNames)) {
          return notice.recipientNames.some(name => name.toLowerCase() === userNameLower);
        }
        // Also consider audience HOD notices where recipientName matches user name
        if (notice.audience === 'HODs' && notice.recipientName) {
          return notice.recipientName.toLowerCase() === userNameLower;
        }
        return false;
      });
      // Combine notices
      const combinedNotices = [...adminNotices, ...directorNotices];
      // Sort combined notices by createdAt descending
      combinedNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(combinedNotices);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // Poll every 60 seconds to refresh notices
    const intervalId = setInterval(fetchNotices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const renderNoticeCard = (notice) => (
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
        {notice.recipientName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Recipient: {notice.recipientName}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 5, mt: 4 }}>
      <Button variant="outlined" onClick={fetchNotices} sx={{ mb: 2 }}>
        Refresh Notices
      </Button>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : notices.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No notices to display.</Typography>
      ) : (
        notices.map(renderNoticeCard)
      )}
    </Box>
  );
}
