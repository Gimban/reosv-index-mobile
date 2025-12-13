import React, { useContext } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import HardwareIcon from "@mui/icons-material/Hardware";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import * as styles from "./SideDrawer.styles";
import { ThemeContext } from "../../contexts/ThemeContext";

const menuItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Sheet Data", icon: <ArticleIcon />, path: "/sheet" },
  { text: "Weapons", icon: <HardwareIcon />, path: "/weapons" },
  { text: "Class", icon: <ArticleIcon />, path: "/class" },
];

export default function SideDrawer({ open, onClose, onMenuItemClick }) {
  const { mode, toggleTheme } = useContext(ThemeContext);
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={styles.drawer}
      variant="temporary"
    >
      <Toolbar sx={styles.toolbar} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => onMenuItemClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText
              primary={mode === "dark" ? "Light 테마" : "Dark 테마"}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
