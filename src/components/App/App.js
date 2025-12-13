import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { CacheProvider } from "../../contexts/CacheContext";
import { ThemeContextProvider } from "../../contexts/ThemeContext";
import Header from "../Header";
import MainContent from "../MainContent";
// import BottomNav from "../BottomNav";
import SheetData from "../SheetData";
import Weapons from "../Weapons";
import WeaponDetail from "../WeaponDetail";
import Class from "../Class";
import SideDrawer from "../SideDrawer"; // SideDrawer import
import * as styles from "./App.styles";

export default function App() {
  // const [tab, setTab] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer 상태 추가
  const location = useLocation();
  const navigate = useNavigate();

  /*
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
  */

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  return (
    <ThemeContextProvider>
      <CacheProvider>
        <Box sx={styles.root}>
          <SideDrawer
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            onMenuItemClick={handleMenuItemClick}
          />
          <Paper elevation={0} square sx={styles.frame}>
            <Header onMenuClick={handleDrawerOpen} />
            {/* 라우트 설정 */}
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="sheet" element={<SheetData />} />
              <Route path="weapons" element={<Weapons />} />
              <Route path="class" element={<Class />} />
              <Route path="weapons/:weaponName" element={<WeaponDetail />} />
              <Route
                path="/search"
                element={
                  <Box sx={{ p: 2, textAlign: "center" }}>Search Page</Box>
                }
              />
              <Route
                path="/profile"
                element={
                  <Box sx={{ p: 2, textAlign: "center" }}>Profile Page</Box>
                }
              />
            </Routes>
            {/* <BottomNav value={tab} onChange={handleTabChange} /> */}
          </Paper>
        </Box>
      </CacheProvider>
    </ThemeContextProvider>
  );
}
