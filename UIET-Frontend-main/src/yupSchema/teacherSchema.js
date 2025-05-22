import * as yup from "yup";

export const teacherSchema = yup.object({
  name: yup
    .string()
    .min(6, "name must contain 6 characters")
    .required("name is required"),
  email: yup
    .string()
    .email("It must be an email")
    .required("Email is required"),
  gender: yup.string().required("gender is required"),
  age: yup.number().required("age is required"),
  qualification: yup
  .string()
  .min(3, "must contain 3 character")
  .required("qualification is required"),

  password: yup
    .string()
    .min(8, "password must contain 8 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password not matched")
    .required("Password is required"),
});




export const teacherEditSchema = yup.object({
  name: yup
    .string()
    .min(6, "name must contain 6 characters")
    .required("name is required"),
  email: yup
    .string()
    .email("It must be an email")
    .required("Email is required"),
  gender: yup.string().required("gender is required"),
  age: yup.number().required("age is required"),
  qualification: yup
    .string()
    .min(3, "must contain 3 character")
    .required("qualification is required"),
  password: yup
    .string()
    .min(8, "password must contain 8 characters"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password not matched")
    ,
});