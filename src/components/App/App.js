import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import Header from "../Header";
import MainContent from "../MainContent";
import BottomNav from "../BottomNav";
import * as styles from "./App.styles";

export default function App() {
  const [tab, setTab] = useState(0);
  const handleTabChange = (_, value) => setTab(value);

  return (
    <Box sx={styles.root}>
      <Paper elevation={0} square sx={styles.frame}>
        <Header />
        <MainContent />
        <BottomNav value={tab} onChange={handleTabChange} />
      </Paper>
    </Box>
  );
}
