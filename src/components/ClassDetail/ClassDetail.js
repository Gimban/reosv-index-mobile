import React, { useContext, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CacheContext } from "../../contexts/CacheContext";
import * as styles from "./ClassDetail.styles";

// src/assets/images/classes 디렉토리의 모든 이미지를 불러옵니다.
const images = require.context(
  "../../assets/images/classes",
  false,
  /\.(png|jpe?g|svg|webp)$/
);

const classImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

const SkillInfo = ({ data, prevData }) => {
  if (!data) return null;

  const skills = [
    { name: "좌클릭", damageKey: "좌클릭 피해량", cdKey: "좌클릭 쿨타임" },
    { name: "우클릭", damageKey: "우클릭 피해량", cdKey: "우클릭 쿨타임" },
    {
      name: "쉬프트 좌클릭",
      damageKey: "쉬프트 좌클릭 피해량",
      cdKey: "쉬프트 좌클릭 쿨타임",
    },
    {
      name: "쉬프트 우클릭",
      damageKey: "쉬프트 우클릭 피해량",
      cdKey: "쉬프트 우클릭 쿨타임",
    },
  ];

  const getDiffString = (current, prev) => {
    if (prev === null || prev === undefined || current === prev) return "";
    const diff = parseFloat(current) - parseFloat(prev);
    if (isNaN(diff) || diff === 0) return "";
    const sign = diff > 0 ? "+" : "";
    return ` (${sign}${diff})`;
  };

  return (
    <TableContainer component={Paper} sx={styles.infoTable}>
      <Table size="small">
        <TableBody>
          {skills.map((skill) => {
            const damage = data[skill.damageKey];
            const cooldown = data[skill.cdKey]; // `data[skill.cdKey]`가 `null`이나 `undefined`일 수 있습니다.

            const isDamageEmpty =
              !damage || damage.trim() === "" || damage.trim() === "0";
            const isCooldownEmpty =
              !cooldown || cooldown.trim() === "" || cooldown.trim() === "0";

            if (isDamageEmpty && isCooldownEmpty) return null;

            const prevDamage = prevData ? prevData[skill.damageKey] : null;
            const prevCooldown = prevData ? prevData[skill.cdKey] : null;

            const damageStr = damage
              ? `${damage}${getDiffString(damage, prevDamage)}`
              : "-";
            const cooldownStr = cooldown
              ? `${cooldown}${getDiffString(cooldown, prevCooldown)}`
              : "-";

            return (
              <React.Fragment key={skill.name}>
                <TableRow>
                  <TableCell component="th" scope="row" rowSpan={2}>
                    {skill.name}
                  </TableCell>
                  <TableCell>피해량</TableCell>
                  <TableCell align="right">{damageStr}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>쿨타임</TableCell>
                  <TableCell align="right">{cooldownStr}</TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ClassDetail = () => {
  const { className } = useParams();
  const { cache } = useContext(CacheContext);
  const { classes } = cache;

  const [advTier, setAdvTier] = useState(null);
  const [enhanceLevel, setEnhanceLevel] = useState(null);

  const formattedClassName = className.replace(/_/g, " ");

  // 현재 클래스 이름에 해당하는 모든 데이터를 배열로 가져옵니다.
  const classDataRows = useMemo(
    () =>
      classes
        ? classes.filter(
            (c) =>
              c["클래스"].toLowerCase() === formattedClassName.toLowerCase()
          )
        : [],
    [classes, formattedClassName]
  );

  // 전직 차수 목록
  const advancementTiers = useMemo(
    () =>
      [...new Set(classDataRows.map((c) => parseInt(c["전직 차수"], 10)))]
        .filter((tier) => !isNaN(tier))
        .sort((a, b) => a - b),
    [classDataRows]
  );

  // 현재 선택된 전직 차수의 강화 레벨 목록
  const enhancementLevels = useMemo(
    () =>
      [
        ...new Set(
          classDataRows
            .filter((c) => parseInt(c["전직 차수"], 10) === advTier)
            .map((c) => parseInt(c["강화 차수"], 10))
        ),
      ]
        .filter((level) => !isNaN(level))
        .sort((a, b) => a - b),
    [classDataRows, advTier]
  );

  useEffect(() => {
    if (advTier === null && advancementTiers.length > 0) {
      setAdvTier(advancementTiers[0]);
    }
  }, [advancementTiers, advTier]);

  useEffect(() => {
    if (advTier !== null && enhancementLevels.length > 0) {
      // 현재 강화 레벨이 목록에 없으면 첫번째 레벨로 설정
      if (!enhancementLevels.includes(enhanceLevel)) {
        setEnhanceLevel(enhancementLevels[0]);
      }
    }
  }, [advTier, enhancementLevels, enhanceLevel]);

  // 현재 선택된 데이터
  const currentData = useMemo(
    () =>
      classDataRows.find(
        (c) =>
          parseInt(c["전직 차수"], 10) === advTier &&
          parseInt(c["강화 차수"], 10) === enhanceLevel
      ),
    [classDataRows, advTier, enhanceLevel]
  );

  // 이전 강화 레벨 데이터 (비교용)
  const prevData = useMemo(() => {
    const prevEnhanceLevel = enhanceLevel - 1;
    if (prevEnhanceLevel < 0) return null;
    return classDataRows.find(
      (c) =>
        parseInt(c["전직 차수"], 10) === advTier &&
        parseInt(c["강화 차수"], 10) === prevEnhanceLevel
    );
  }, [classDataRows, advTier, enhanceLevel]);

  if (!classes) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>클래스 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (classDataRows.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography color="error">클래스 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  const handleTierChange = (direction) => {
    const currentIndex = advancementTiers.indexOf(advTier);
    const nextIndex =
      (currentIndex + direction + advancementTiers.length) %
      advancementTiers.length;
    setAdvTier(advancementTiers[nextIndex]);
  };

  const handleLevelChange = (direction) => {
    const currentIndex = enhancementLevels.indexOf(enhanceLevel);
    const nextIndex =
      (currentIndex + direction + enhancementLevels.length) %
      enhancementLevels.length;
    setEnhanceLevel(enhancementLevels[nextIndex]);
  };

  if (!currentData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const classImageSrc = classImages[`${currentData["ID"]}${advTier}.webp`];

  return (
    <Box sx={styles.root}>
      {classImageSrc && (
        <Box
          component="img"
          src={classImageSrc}
          alt={currentData["클래스"]}
          sx={styles.classImage}
        />
      )}
      <Typography sx={styles.className}>{currentData["클래스"]}</Typography>

      {/* 전직 차수 컨트롤 */}
      <Box sx={styles.levelControl}>
        <IconButton onClick={() => handleTierChange(-1)}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6">{advTier}차 전직</Typography>
        <IconButton onClick={() => handleTierChange(1)}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* 강화 차수 컨트롤 */}
      <Box sx={styles.levelControl}>
        <IconButton onClick={() => handleLevelChange(-1)}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6">+{enhanceLevel} 강화</Typography>
        <IconButton onClick={() => handleLevelChange(1)}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* 스킬 정보 */}
      <SkillInfo data={currentData} prevData={prevData} />
    </Box>
  );
};

export default ClassDetail;
