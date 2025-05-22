import * as yup from "yup";

export const studentSchema = yup.object({
  name: yup
    .string()
    .min(6, "name must contain 6 characters")
    .required("name is required"),
  email: yup
    .string()
    .email("It must be an email")
    .required("Email is required"),
  student_class: yup.string().required("student class is required field"),
  gender: yup.string().required("gender is required"),
  age: yup.number().required("age is required"),
  student_contact: yup
    .string()
    .min(9, "must contain 9 character")
    .max(11, "can't extend 11 characters")
    .required("student contact is required"),
  guardian: yup
    .string()
    .min(4, "must contain 4 characters")
    .required("guardian is required"),
  guardian_phone: yup
    .string()
    .min(9, "must contain 9 character")
    .max(11, "can't extend 11 characters")
    .required("guardian phone is required"),

  password: yup
    .string()
    .min(8, "password must contain 8 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password not matched")
    .required("Password is required"),
});




export const studentEditSchema = yup.object({
  name: yup
    .string()
    .min(6, "name must contain 6 characters")
    .required("name is required"),
  email: yup
    .string()
    .email("It must be an email")
    .required("Email is required"),
  student_class: yup.string().required("student class is required field"),
  gender: yup.string().required("gender is required"),
  age: yup.number().required("age is required"),
  student_contact: yup
    .string()
    .min(9, "must contain 9 character")
    .max(11, "can't extend 11 characters")
    .required("student contact is required"),
  guardian: yup
    .string()
    .min(4, "must contain 4 characters")
    .required("guardian is required"),
  guardian_phone: yup
    .string()
    .min(9, "must contain 9 character")
    .max(11, "can't extend 11 characters")
    .required("guardian phone is required"),

  password: yup
    .string()
    .min(8, "password must contain 8 characters"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password not matched")
    ,
});