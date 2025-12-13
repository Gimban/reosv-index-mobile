import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton, // IconButton 추가
  Table, // Table 관련 컴포넌트 추가
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"; // 아이콘 추가
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CacheContext } from "../../contexts/CacheContext";
import * as styles from "./WeaponDetail.styles";

// src/assets/images/weapons 디렉토리의 모든 이미지를 불러옵니다.
const images = require.context(
  "../../assets/images/weapons",
  false,
  /\.(png|jpe?g|svg|webp)$/
);

const weaponImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

const ReinforcementInfo = ({ weapon, level }) => {
  if (!weapon || level === null) return null;

  // 표시하지 않을 기본 정보 컬럼들
  const excludedKeys = new Set([
    "등급값",
    "이름",
    "등급",
    "이미지 파일",
    "강화 차수",
    "",
    "설명",
    "비고",
  ]);

  const stats = Object.entries(weapon)
    .filter(
      ([key, value]) => !excludedKeys.has(key) && value && value.trim() !== ""
    )
    .map(([key, value]) => ({
      name: key,
      value: value,
    }));

  if (stats.length === 0) {
    if (level > 0) {
      return (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          이 강화 단계의 추가 능력치 정보가 없습니다.
        </Typography>
      );
    }
    return null;
  }

  return (
    <TableContainer component={Paper} sx={styles.reinforcementInfo}>
      <Table size="small">
        <TableBody>
          {stats.map((data, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {data.name}
              </TableCell>
              <TableCell align="right">{data.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const WeaponDetail = () => {
  const { weaponName } = useParams();
  const { cache } = useContext(CacheContext);
  const { weapons } = cache;
  const [level, setLevel] = useState(null);

  const formattedWeaponName = weaponName.replace(/_/g, " ");

  // 현재 무기 이름에 해당하는 모든 강화 단계의 데이터를 배열로 가져옵니다.
  const weaponLevels = weapons
    ? weapons.filter(
        (w) => w["이름"].toLowerCase() === formattedWeaponName.toLowerCase()
      )
    : null;

  // 현재 level에 해당하는 무기 데이터를 찾습니다.
  const weapon =
    weaponLevels?.find((w) => parseInt(w["강화 차수"], 10) === level) ||
    weaponLevels?.[0];

  useEffect(() => {
    // 컴포넌트가 처음 로드될 때만 초기 레벨을 설정합니다.
    // 의존성 배열을 비워두어 이 effect가 한 번만 실행되도록 합니다.
    if (level === null && weaponLevels && weaponLevels.length > 0) {
      // 초기 레벨을 0으로 설정하거나, 0레벨 데이터가 없으면 첫번째 데이터의 강화 차수로 설정
      const initialLevelData = weaponLevels.find(
        (w) => parseInt(w["강화 차수"], 10) === 0
      );
      setLevel(
        initialLevelData ? 0 : parseInt(weaponLevels[0]["강화 차수"], 10)
      );
    }
  }, [weapons, formattedWeaponName, level, weaponLevels]); // level과 weaponLevels를 추가하여 초기화 로직을 제어합니다.

  if (!weapons || !weaponLevels) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>무기 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!weapon) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography color="error">무기 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  // weaponLevels 배열에서 가장 높은 "강화 차수"를 찾아 maxLevel로 설정합니다.
  const maxLevel = weaponLevels.reduce((max, w) => {
    const currentLevel = parseInt(w["강화 차수"], 10);
    return !isNaN(currentLevel) && currentLevel > max ? currentLevel : max;
  }, 0);
  const weaponImageSrc = weaponImages[`${weaponLevels[0]["이미지 파일"]}.webp`];

  const minLevel = 0;

  const handlePrevLevel = () => {
    setLevel((prevLevel) => (prevLevel > minLevel ? prevLevel - 1 : maxLevel));
  };

  const handleNextLevel = () => {
    setLevel((prevLevel) => (prevLevel < maxLevel ? prevLevel + 1 : minLevel));
  };

  return (
    <Box sx={styles.root}>
      {weaponImageSrc && (
        <Box
          component="img"
          src={weaponImageSrc}
          alt={weapon["이름"]}
          sx={styles.weaponImage}
        />
      )}
      <Typography sx={styles.weaponName}>{weapon["이름"]}</Typography>

      {level !== null && (
        <Box sx={styles.levelControl}>
          <IconButton onClick={handlePrevLevel}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="h6">{`+${level} 강화`}</Typography>
          <IconButton onClick={handleNextLevel}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}

      <ReinforcementInfo weapon={weapon} level={level} />

      {(weapon["설명"] || weapon["비고"]) && (
        <Paper sx={{ p: 2, mt: 2 }}>
          {weapon["설명"] && (
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {weapon["설명"]}
            </Typography>
          )}
          {weapon["비고"] && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: weapon["설명"] ? 2 : 0, whiteSpace: "pre-wrap" }}
            >
              {weapon["비고"]}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default WeaponDetail;
