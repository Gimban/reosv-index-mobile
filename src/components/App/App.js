import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import MainContent from "../MainContent";
import BottomNav from "../BottomNav";
import SheetData from "../SheetData";
import * as styles from "./App.styles";

export default function App() {
  const [tab, setTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setTab(0);
        break;
      case "/search":
        setTab(1);
        break;
      case "/profile":
        setTab(2);
        break;
      default:
        setTab(-1);
        break;
    }
  }, [location.pathname]);

  const handleTabChange = (_, value) => {
    switch (value) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/search");
        break;
      case 2:
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={styles.root}>
      <Paper elevation={0} square sx={styles.frame}>
        <Header />
        {/* 라우트 설정 */}
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="sheet" element={<SheetData />} />
          <Route path="/search" element={<box sx={{p: 2, textAlign: "center"}}>Search Page</box>} />
          <Route path="/profile" element={<box sx={{p: 2, textAlign: "center"}}>Profile Page</box>} />
        </Routes>
        <BottomNav value={tab} onChange={handleTabChange} />
      </Paper>
    </Box>
  );
}
