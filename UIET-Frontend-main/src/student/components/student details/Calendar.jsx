import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Calendar() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const prevLastDay = new Date(year, month, 0);
  const daysInPrevMonth = prevLastDay.getDate();

  // Create array to hold all day objects for display (42 cells)
  const totalCells = 42;
  const days = [];

  for (let i = 0; i < totalCells; i++) {
    let dayNumber;
    let date;
    let isCurrentMonth = true;

    if (i < startDay) {
      dayNumber = daysInPrevMonth - startDay + 1 + i;
      date = new Date(year, month - 1, dayNumber);
      isCurrentMonth = false;
    } else if (i < startDay + daysInMonth) {
      dayNumber = i - startDay + 1;
      date = new Date(year, month, dayNumber);
    } else {
      dayNumber = i - (startDay + daysInMonth) + 1;
      date = new Date(year, month + 1, dayNumber);
      isCurrentMonth = false;
    }
    days.push({ dayNumber, date, isCurrentMonth });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if date is today
  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Paper
      elevation={6}
      sx={{
        maxWidth: 400,
        margin: "auto",
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        userSelect: "none",
      }}
      aria-label="Calendar"
      role="region"
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.5,
        }}
      >
        <IconButton
          onClick={handlePrevMonth}
          sx={{
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </IconButton>
        <Typography
          variant={isXs ? "h6" : "h5"}
          fontWeight="bold"
          component="div"
          aria-live="polite"
          aria-atomic="true"
        >
          {months[month]} {year}
        </Typography>
        <IconButton
          onClick={handleNextMonth}
          sx={{
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          aria-label="Next month"
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, pt: 2, pb: 3, bgcolor: "background.default" }}>
        <Grid container spacing={0} sx={{ userSelect: "none" }}>
          {weekdays.map((day) => (
            <Grid
              item
              xs={12 / 7}
              key={day}
              sx={{
                textAlign: "center",
                fontWeight: "600",
                color: "text.secondary",
                mb: 1,
                fontSize: isXs ? "0.75rem" : "0.85rem",
              }}
              aria-hidden="true"
            >
              {day}
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={1}>
          {days.map(({ dayNumber, date, isCurrentMonth }, idx) => {
            const todayClass = isToday(date) && isCurrentMonth ? true : false;
            return (
              <Grid item xs={12 / 7} key={idx}>
                <Box
                  sx={{
                    bgcolor: todayClass ? "primary.main" : "background.paper",
                    color: todayClass
                      ? "primary.contrastText"
                      : isCurrentMonth
                      ? "text.primary"
                      : "text.disabled",
                    borderRadius: 2,
                    py: 1.25,
                    textAlign: "center",
                    fontWeight: todayClass ? "700" : "500",
                    cursor: isCurrentMonth ? "pointer" : "default",
                    boxShadow: todayClass
                      ? "0 0 10px rgba(25, 118, 210, 0.6)"
                      : "none",
                    transition: "background-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      bgcolor:
                        isCurrentMonth && !todayClass
                          ? "primary.light"
                          : undefined,
                      color:
                        isCurrentMonth && !todayClass
                          ? "primary.contrastText"
                          : undefined,
                    },
                    userSelect: "none",
                  }}
                  tabIndex={isCurrentMonth ? 0 : -1}
                  role={isCurrentMonth ? "button" : undefined}
                  aria-label={`${
                    months[date.getMonth()]
                  } ${date.getDate()}, ${date.getFullYear()}`}
                >
                  {dayNumber}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
}

export default Calendar;
