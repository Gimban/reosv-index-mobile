import React, { useMemo, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as styles from "./DpsCalc.styles";
import { useDpsCalc } from "../../contexts/DpsCalcContext";
import { CacheContext } from "../../contexts/CacheContext";
import { useFinalStats } from "../../hooks/useFinalStats";

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
  { id: "guild", title: "길드", path: "/dps_calc/guild" },
];

const DpsCalc = () => {
  const navigate = useNavigate();
  const { dpsState } = useDpsCalc();
  const { cache } = useContext(CacheContext);
  const { weapons: allWeaponsData } = cache;

  const handleStateCheck = () => {
    console.log("DPS Calc State:", dpsState);
  };

  // 특수 무기 데이터를 계산에 용이하도록 가공
  const processedWeaponData = useMemo(() => {
    if (!allWeaponsData) return {};
    const data = {};
    allWeaponsData.forEach((w) => {
      const name = w["이름"];
      if (!name) return;
      if (!data[name]) {
        data[name] = {
          enhancements: [],
          byEnhancement: {},
        };
      }
      const enh = parseInt(w["강화 차수"], 10);
      if (!isNaN(enh)) {
        data[name].enhancements.push(enh);
        data[name].byEnhancement[enh] = w;
      }
    });

    Object.values(data).forEach((entry) => {
      entry.enhancements.sort((a, b) => a - b);
    });

    return data;
  }, [allWeaponsData]);

  const finalStats = useFinalStats(dpsState, processedWeaponData);

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        DPS Calculator
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          최종 계산 결과
        </Typography>
        <Typography>
          총 DPS (일반): {finalStats.totalDpsVsNormal.toFixed(2)}
        </Typography>
        <Typography>
          총 DPS (보스): {finalStats.totalDpsVsBoss.toFixed(2)}
        </Typography>
        <Typography>
          총 DPM (일반): {finalStats.totalDpmVsNormal.toFixed(2)}
        </Typography>
        <Typography>
          총 DPM (보스): {finalStats.totalDpmVsBoss.toFixed(2)}
        </Typography>
        <Typography>최대 마나: {finalStats.totalMaxMana.toFixed(2)}</Typography>
        <Typography>
          초당 마나 소모: {finalStats.totalMps.toFixed(2)}
        </Typography>
        <Typography>
          초당 마나 회복: {finalStats.totalMpr.toFixed(2)}
        </Typography>
      </Paper>
      <Divider sx={{ mb: 2 }} />
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
