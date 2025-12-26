import React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as styles from "./DpsCalc.styles";
import { useDpsCalc } from "../../contexts/DpsCalcContext";

// 추후 추가될 항목들을 위한 설정
const MENU_ITEMS = [
  // 예시: { id: 'basic_stats', title: '기본 스탯', path: '/dps_calc/basic_stats' },
  { id: "level", title: "레벨", path: "/dps_calc/level" },
  { id: "class", title: "클래스", path: "/dps_calc/class" },
  {
    id: "special_weapon",
    title: "특수 무기",
    path: "/dps_calc/special_weapon",
  },
  { id: "accessory", title: "장신구", path: "/dps_calc/accessory" },
  { id: "divine_shard", title: "디바인 샤드", path: "/dps_calc/divine_shard" },
];

const DpsCalc = () => {
  const navigate = useNavigate();
  const { dpsState } = useDpsCalc();

  const handleStateCheck = () => {
    console.log("DPS Calc State:", dpsState);
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        DPS Calculator
      </Typography>
      <Button variant="contained" onClick={handleStateCheck} sx={{ mb: 2 }}>
        전역 상태 확인
      </Button>
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
