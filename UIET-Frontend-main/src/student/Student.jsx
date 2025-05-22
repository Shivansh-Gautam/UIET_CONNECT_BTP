import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, Avatar } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NoteIcon from "@mui/icons-material/Note";
import AddCardIcon from "@mui/icons-material/AddCard";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SubjectIcon from "@mui/icons-material/Subject";
import ExplicitIcon from "@mui/icons-material/Explicit";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import ClassIcon from "@mui/icons-material/Class";
import HomeIcon from "@mui/icons-material/Home";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import LogoutIcon from "@mui/icons-material/Logout";
import { baseApi } from "../environment";
import axios from "axios";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: "linear-gradient(to right, #3f51b5, #5a55ae)",
  color: "#fff",
  zIndex: theme.zIndex.drawer + 1,
  borderRadius: "20px", // All four corners rounded
  marginTop: "10px",
  marginLeft: open
    ? `calc(${drawerWidth}px + 24px)`
    : `calc(${theme.spacing(7)} + 32px)`,
  marginRight: "16px", // <-- Added right margin
  width: open
    ? `calc(100% - ${drawerWidth}px - 40px)` // Adjusted width (24px left + 16px right)
    : `calc(100% - ${theme.spacing(7)} - 48px)`, // Adjusted width (32px left + 16px right)
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      borderTopRightRadius: "20px",
      borderBottomRightRadius: "20px",
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "8px",
      marginRight: "16px", // Added right margin to drawer
      height: "calc(100% - 20px)",
      boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      borderTopRightRadius: "20px",
      borderBottomRightRadius: "20px",
      marginTop: "10px",
      marginBottom: "10px",
      marginLeft: "8px",
      marginRight: "16px", // Added right margin to drawer (even collapsed)
      height: "calc(100% - 20px)",
      boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    },
  }),
}));

export default function Student() {
  const theme = useTheme();
  const token = localStorage.getItem("authToken");
  const [student, setStudent] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [editing, setEditing] = React.useState(false);
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openProfileMenu = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const navArr = [
    { link: "/student", component: "Your Details", icon: DashboardIcon },
    { link: "/student/notes", component: "Notes", icon: NoteIcon },
    { link: "/student/notice", component: "Notice", icon: NotificationsIcon },
    {
      link: "/student/examinations",
      component: "Examinations",
      icon: ExplicitIcon,
    },
    { link: "/student/schedule", component: "Schedule", icon: EventIcon },
    {
      link: "/student/attendance",
      component: "Attendance",
      icon: RecentActorsIcon,
    },
    {
      link: "/student/profile",
      component: "Profile",
      icon: AccountBoxIcon,
    },
    {
      link: "/student/student-id",
      component: "ID Generator",
      icon: AddCardIcon,
    },
    {
      link: "/student/assignment",
      component: "Assignment",
      icon: DocumentScannerIcon,
    },
    { link: "/logout", component: "Log Out", icon: LogoutIcon },
  ];

  const handleNavigation = (link) => {
    navigate(link);
  };

  const fetchStudentDetails = async () => {
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
      const response = await axios.get(`${baseApi}/student/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data.student);
      setFormData(response.data.student);
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
  };

  React.useEffect(() => {
    fetchStudentDetails();
  }, []);

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#f5f7fa", minHeight: "100vh" }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ marginRight: 5, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              UIET - CONNECT
            </Typography>
          </Box>

          {/* Profile Icon */}
          <IconButton color="inherit" onClick={handleProfileClick}>
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Toolbar>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              gap: 1,
              minWidth: 200,
            }}
          >
            <Avatar sx={{ bgcolor: "#1976d2", width: 64, height: 64 }}>
              {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
            </Avatar>

            {student ? (
              <>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {student.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.email}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Loading...
                </Typography>
              </>
            )}

            <Divider sx={{ width: "100%", my: 1 }} />

            <MenuItem
              onClick={() => {
                handleProfileClose();
                navigate("/student/profile");
              }}
            >
              View Profile
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleProfileClose();
                navigate("/logout");
              }}
            >
              Logout
            </MenuItem>
          </Box>
        </Menu>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {open && (
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />
        <List>
          {navArr.map((navItem, index) => {
            const isActive = location.pathname === navItem.link;
            return (
              <ListItem key={index} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    borderRadius: "12px",
                    m: 0.5,
                    backgroundColor: isActive ? "#e3f2fd" : "transparent",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                  onClick={() => handleNavigation(navItem.link)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#1976d2" : "inherit",
                    }}
                  >
                    {<navItem.icon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={navItem.component}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}
