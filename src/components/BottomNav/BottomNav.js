import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import * as styles from "./BottomNav.styles";

export default function BottomNav({ value, onChange }) {
  return (
    <Paper square sx={styles.wrapper}>
      <BottomNavigation value={value} onChange={onChange} showLabels>
        <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchRoundedIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonRoundedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
