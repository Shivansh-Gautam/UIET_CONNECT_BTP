import { Grid, Paper } from "@mui/material";
import Greeting from "../../../basic utility components/Greeting";
import StudentProfile from "./StudentProfile";
import ToDoList from "./ToDoList";
import Calendar from "./Calendar";
import Notification from "./Notification";

const StudentDetails = () => {
  return (
    <>
      <Greeting role={"student"} apiEndpoint={"api/student/fetch-single"} />

      <div className="p-4">
        <Grid container spacing={3}>
          {/* Left Column: ToDo + Notification side by side */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{ backgroundColor: "transparent", p: 2 }}
                >
                  <ToDoList />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{ backgroundColor: "transparent", p: 2 }}
                >
                  <Notification />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column: Calendar */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ backgroundColor: "transparent", p: 2 }}>
              <Calendar />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default StudentDetails;
