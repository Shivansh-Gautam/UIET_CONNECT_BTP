import * as yup from "yup";

export const noticeSchema = yup.object({
  title: yup
    .string()
    .min(3, "atleaset 3 characters required")
    .required("notice title is required"),

  message: yup
    .string()
    .min(8, "atleast 8 characters ar required")
    .required("message is required"),

  audience: yup.string().required("audience is required"),
});
