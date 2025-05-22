import * as yup from "yup";

export const periodSchema = yup.object({
  teacher: yup.string().required("Teacher field is required"),
  subject: yup.string().required("Subject field is required"),
  semester: yup.string().required("Semester field is required"),
  day: yup.number().required("Day is required"), // Ensure day is validated
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
});
