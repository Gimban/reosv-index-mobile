import React, { useState, lazy, Suspense } from "react";
import { Box, Paper } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import { CacheProvider } from "../../contexts/CacheContext";
import { ThemeContextProvider } from "../../contexts/ThemeContext";
import { DpsCalcProvider } from "../../contexts/DpsCalcContext";
import Header from "../Header";
// import BottomNav from "../BottomNav";
import SideDrawer from "../SideDrawer"; // SideDrawer import
import * as styles from "./App.styles";

const MainContent = lazy(() => import("../MainContent"));
const SheetData = lazy(() => import("../SheetData"));
const Weapons = lazy(() => import("../Weapons"));
const WeaponDetail = lazy(() => import("../WeaponDetail"));
const Class = lazy(() => import("../Class"));
const ClassDetail = lazy(() => import("../ClassDetail"));
const EnhSim = lazy(() => import("../EnhSim"));
const DpsCalc = lazy(() => import("../DpsCalc"));
const Level = lazy(() => import("../DpsCalc/Level"));
const ClassWeapon = lazy(() => import("../DpsCalc/ClassWeapon"));
const SpecialWeapon = lazy(() => import("../DpsCalc/SpecialWeapon"));
const Accessory = lazy(() => import("../DpsCalc/Accessory"));

export default function App() {
  // const [tab, setTab] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer 상태 추가
  // const location = useLocation();
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
        <DpsCalcProvider>
          <Box sx={styles.root}>
            <SideDrawer
              open={isDrawerOpen}
              onClose={handleDrawerClose}
              onMenuItemClick={handleMenuItemClick}
            />
            <Paper elevation={0} square sx={styles.frame}>
              <Header onMenuClick={handleDrawerOpen} />
              {/* 라우트 설정 */}
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<MainContent />} />
                  <Route path="sheet" element={<SheetData />} />
                  <Route path="weapons" element={<Weapons />} />
                  <Route path="class" element={<Class />} />
                  <Route
                    path="weapons/:weaponName"
                    element={<WeaponDetail />}
                  />
                  <Route path="classes/:className" element={<ClassDetail />} />
                  <Route path="/enh_sim" element={<EnhSim />} />
                  <Route path="/dps_calc" element={<DpsCalc />} />
                  <Route path="/dps_calc/level" element={<Level />} />
                  <Route path="/dps_calc/class" element={<ClassWeapon />} />
                  <Route
                    path="/dps_calc/special_weapon"
                    element={<SpecialWeapon />}
                  />
                  <Route path="/dps_calc/accessory" element={<Accessory />} />
                </Routes>
              </Suspense>
              {/* <BottomNav value={tab} onChange={handleTabChange} /> */}
            </Paper>
          </Box>
        </DpsCalcProvider>
      </CacheProvider>
    </ThemeContextProvider>
  );
}
