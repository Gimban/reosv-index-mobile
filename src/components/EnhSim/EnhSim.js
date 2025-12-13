import React, { useState } from "react";
import { Box, Typography, Container, AppBar, Tabs, Tab } from "@mui/material";
import SpecialWeapon from "./SpecialWeapon";
import ClassWeapon from "./ClassWeapon";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enh-sim-tabpanel-${index}`}
      aria-labelledby={`enh-sim-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function EnhSim() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Container>
        <Box sx={{ my: 2, textAlign: "center" }}>
          <Typography variant="h5" component="h1" gutterBottom>
            강화 시뮬레이션
          </Typography>
        </Box>
      </Container>
      <Box sx={{ width: "100%" }}>
        <AppBar position="static">
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label="특수 무기" />
            <Tab label="클래스 무기" />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <SpecialWeapon />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ClassWeapon />
        </TabPanel>
      </Box>
    </>
  );
}
