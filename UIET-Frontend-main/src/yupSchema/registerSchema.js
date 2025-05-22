import * as yup from "yup";

export const registerSchema = yup.object({
  department_name: yup
    .string()
    .min(6, "Department name must contain 6 characters")
    .required("Department name is required"),
  email: yup
    .string()
    .email("It must be an email")
    .required("Email is required"),
  hod_name: yup
    .string()
    .min(6, "Hod name must contain 6 characters")
    .required("Hod name is required"),
  passcode: yup
    .string()
    .min(6, "passcode must contain 6 characters")
    .required("passcode is required").oneOf(["Csjmu@123"],"enter correct passcode to register yourself"),
  password: yup
    .string()
    .min(8, "password must contain 8 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password not matched")
    .required("Password is required"),
});
