import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, TextField, MenuItem, GlobalStyles } from "@mui/material";
import axios from "axios";
import ScheduleEvent from "./ScheduleEvent";
import { baseApi } from "../../../environment";

export default function Schedule() {
  const [newPeriod, setNewPeriod] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) fetchSchedule();
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const { data } = await axios.get(`${baseApi}/api/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(data.data);
      if (data.data.length) setSelectedSemester(data.data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedule = async () => {
    try {
      const { data } = await axios.get(
        `${baseApi}/api/schedule/fetch-with-semester/${selectedSemester}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formatted = data.data
        .filter((ev) => ev.day >= 1 && ev.day <= 6)
        .map((ev) => ({
          id: ev._id,
          title: `${ev.subject.subject_name} - ${ev.teacher.name}`,
          daysOfWeek: [ev.day],
          startTime: ev.startTime,
          endTime: ev.endTime,
        }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventAdded = () => {
    setNewPeriod(false);
    setTimeout(fetchSchedule, 300);
  };

  // custom renderer: subject on first line, teacher on second
  const renderEventContent = (info) => {
    const [subject, teacher] = info.event.title.split(" - ");
    return (
      <div
        style={{
          background: "#1976d2",
          color: "#fff",
          borderRadius: 4,
          padding: "4px 6px",
          fontSize: 12,
          lineHeight: 1.2,
        }}
      >
        <div style={{ fontWeight: 600 }}>{subject}</div>
        <div style={{ fontStyle: "italic", opacity: 0.9 }}>{teacher}</div>
      </div>
    );
  };

  return (
    <>
      {/* Global overrides for FullCalendar */}
      <GlobalStyles
        styles={{
          ".fc-timegrid-col, .fc-daygrid-day-frame": {
            minWidth: "120px !important",
          },
          ".fc-col-header-cell": {
            backgroundColor: "#f0f0f0",
            border: "none",
            padding: "8px !important",
            textAlign: "center",
          },
          ".fc-scroller": {
            overflowX: "auto !important",
            overflowY: "auto !important",
            maxHeight: "70vh",
          },
          ".fc-button": {
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            "&:hover": {
              backgroundColor: "#155fa0",
            },
          },
          ".fc-button-active": {
            backgroundColor: "#155fa0 !important",
          },
        }}
      />

      <Box sx={{ p: 2 }}>
        <TextField
          select
          fullWidth
          label="Year"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Year</MenuItem>
          {semesters.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.semester_text} ({s.semester_num})
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          onClick={() => setNewPeriod(true)}
          disabled={!selectedSemester}
          sx={{ mb: 2 }}
        >
          Add New Period
        </Button>

        {newPeriod && (
          <ScheduleEvent
            selectedSemester={selectedSemester}
            onEventAdded={handleEventAdded}
          />
        )}

        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            hiddenDays={[0]} // remove Sunday
            events={events}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay",
            }}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            editable={false}
            selectable={false}
            nowIndicator
            eventContent={renderEventContent}
            height="auto"
            contentHeight="auto"
          />
        </Box>
      </Box>
    </>
  );
}
