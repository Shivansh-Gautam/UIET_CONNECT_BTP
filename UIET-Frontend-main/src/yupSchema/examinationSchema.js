import * as yup from "yup";

export const examinationSchema = yup.object({
  examDate: yup.string().required("Date is required"), // Changed from date() to string()
  semester: yup.string().required("Semester is required"), // Added semester validation
  subject: yup.string().required("Subject is required"),
  examType: yup.string().required("Exam type is required"),
});
