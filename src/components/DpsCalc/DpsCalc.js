import React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as styles from "./DpsCalc.styles";

// 추후 추가될 항목들을 위한 설정
const MENU_ITEMS = [
  // 예시: { id: 'basic_stats', title: '기본 스탯', path: '/dps_calc/basic_stats' },
  { id: "level", title: "레벨", path: "/dps_calc/level" },
];

const DpsCalc = () => {
  const navigate = useNavigate();

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        DPS Calculator
      </Typography>
      <Box sx={styles.gridContainer}>
        {MENU_ITEMS.map((item) => (
          <Card key={item.id} sx={styles.card}>
            <CardActionArea
              sx={styles.cardAction}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={styles.cardContent}>
                <Typography variant="h6" align="center">
                  {item.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DpsCalc;
