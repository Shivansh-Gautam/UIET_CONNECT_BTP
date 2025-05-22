import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

export default function HomeOut() {
  const { homeout } = useContext(AuthContext);
  const navigate = useNavigate()

  useEffect(() => {
    homeout();
    navigate("/")
  }, []);

  return(<>
  Home out</>)
}
