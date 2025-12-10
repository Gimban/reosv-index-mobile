import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import HardwareIcon from '@mui/icons-material/Hardware';
import * as styles from "./SideDrawer.styles";

const menuItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Sheet Data", icon: <ArticleIcon />, path: "/sheet" },
  { text: "Weapons", icon: <HardwareIcon />, path: "/weapons" },
];

export default function SideDrawer({ open, onClose, onMenuItemClick }) {
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
    </Drawer>
  );
}
