import { Outlet } from "react-router-dom";
import Navbar from "./utility components/navbar/Navbar";
import { Box } from "@mui/material";
// import React from "react";

import Footer from "./utility components/footer/footer";

export default function Client() {
  return (
    <>
      <Navbar />
      <Box sx={{minHeight:'80vh'}} component={'div'}>
      <Outlet />
      </Box>
      <Footer />
    </>
  );
}
