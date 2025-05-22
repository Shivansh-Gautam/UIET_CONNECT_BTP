import * as yup from "yup";

export const semesterSchema = yup.object({
  semester_text: yup
    .string().min(3,"atleaset 3 characters required").required("Semester Text is required"),

  semester_num: yup
    .string().required("semester num is required"),
});
