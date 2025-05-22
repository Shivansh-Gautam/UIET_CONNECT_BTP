import React, { useState } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function formatTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
  return date.toLocaleDateString();
}

const Notification = () => {
  const [notices, setNotices] = useState([
    {
      id: 1,
      text: "You have a new message from John.",
      time: new Date(Date.now() - 2 * 60000),
    }, // 2 minutes ago
    {
      id: 2,
      text: "Your subscription will expire in 3 days.",
      time: new Date(Date.now() - 3600000),
    }, // 1 hour ago
    {
      id: 3,
      text: "System update completed successfully.",
      time: new Date(Date.now() - 7200000),
    }, // 2 hours ago
    {
      id: 4,
      text: "New comment on your photo.",
      time: new Date(Date.now() - 86400000),
    }, // 1 day ago
    {
      id: 5,
      text: "Password changed successfully.",
      time: new Date(Date.now() - 172800000),
    }, // 2 days ago
  ]);

  const handleDismiss = (id) => {
    setNotices(notices.filter((notice) => notice.id !== id));
  };

  return (
    <Paper
      elevation={4}
      sx={{ width: 360, maxHeight: "80vh", overflowY: "auto", borderRadius: 2 }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
        <Typography
          variant="h6"
          component="h2"
          fontWeight="bold"
          color="primary"
        >
          Notices
        </Typography>
      </Box>
      <List disablePadding>
        {notices.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No notices"
              primaryTypographyProps={{
                color: "text.secondary",
                fontStyle: "italic",
              }}
            />
          </ListItem>
        ) : (
          notices.map(({ id, text, time }) => (
            <React.Fragment key={id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="dismiss"
                    onClick={() => handleDismiss(id)}
                  >
                    <CloseIcon />
                  </IconButton>
                }
                alignItems="flex-start"
              >
                <ListItemText
                  primary={text}
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="span"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {formatTime(time)}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default Notification;
