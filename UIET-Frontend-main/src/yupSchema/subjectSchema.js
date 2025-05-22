import * as yup from "yup";

export const subjectSchema = yup.object({
  subject_name: yup
    .string().min(3,"atleaset 3 characters required").required("subject name is required"),

  subject_codename: yup
    .string().required("subject codename is required"),
    student_class: yup.string().required("student class is required field"),
});
