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

const ReinforcementInfo = ({ weapon, prevWeapon, level }) => {
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
    "피해량",
    "타수",
  ]);

  // 숫자와 단위를 분리하는 함수 (예: "10s" -> [10, "s"])
  const parseValue = (str) => {
    if (!str) return [null, null];
    const num = parseFloat(str);
    const unit = str.replace(String(num), "").trim();
    return [isNaN(num) ? null : num, unit];
  };

  let stats = Object.entries(weapon)
    .filter(
      ([key, value]) => !excludedKeys.has(key) && value && value.trim() !== ""
    )
    .filter(([key, value]) => {
      // 마나가 0이면 표시하지 않음
      if (key === "마나") {
        return parseFloat(value) !== 0;
      }
      return true;
    })
    .map(([key, value]) => {
      let displayValue = value;
      // 피해량, 쿨타임, 마나에 대한 변화량 표시
      if (prevWeapon && ["쿨타임", "마나"].includes(key)) {
        const [currentNum, currentUnit] = parseValue(value);
        const [prevNum, prevUnit] = parseValue(prevWeapon[key]);

        if (
          currentNum !== null &&
          prevNum !== null &&
          currentUnit === prevUnit
        ) {
          const diff = currentNum - prevNum;
          if (diff !== 0) {
            const sign = diff > 0 ? "+" : "";
            // toFixed(2)로 소수점 2자리까지, .replace(/\.?0+$/, "")로 불필요한 0 제거
            const diffStr = parseFloat(diff.toFixed(2)).toString();
            displayValue = `${value} (${sign}${diffStr}${currentUnit})`;
          }
        }
      }
      return { name: key, value: displayValue };
    });

  // 피해량 x 타수 조합
  const damage = weapon["피해량"];
  const hits = weapon["타수"];

  if (damage && hits) {
    const [damageNum] = parseValue(damage);
    const [hitsNum] = parseValue(hits);

    if (damageNum !== null && hitsNum !== null && damageNum > 0) {
      let damageStr = damage;
      let hitsStr = "";
      let totalDamageStr = "";
      let totalDamageDiffStr = "";

      // 이전 단계와 비교하여 변화량 계산
      if (prevWeapon && prevWeapon["피해량"] && prevWeapon["타수"]) {
        const [prevDamageNum] = parseValue(prevWeapon["피해량"]);
        const [prevHitsNum] = parseValue(prevWeapon["타수"]);

        if (prevDamageNum !== null && prevHitsNum !== null) {
          // 1. 피해량 변화량
          const damageDiff = damageNum - prevDamageNum;
          if (damageDiff !== 0) {
            const sign = damageDiff > 0 ? "+" : "";
            const diffStr = parseFloat(damageDiff.toFixed(2)).toString();
            damageStr += ` (${sign}${diffStr})`;
          }

          // 2. 총 피해량 변화량
          const totalDamage = damageNum * hitsNum;
          const prevTotalDamage = prevDamageNum * prevHitsNum;
          const totalDamageDiff = totalDamage - prevTotalDamage;

          if (totalDamageDiff !== 0) {
            const sign = totalDamageDiff > 0 ? "+" : "";
            const diffStr = parseFloat(totalDamageDiff.toFixed(2)).toString();
            totalDamageDiffStr = ` (${sign}${diffStr})`;
          }
        }
      }

      // 타수가 1보다 크면 표시
      if (hitsNum > 1) {
        hitsStr = ` x ${hits}`;
      }

      // 타수가 1보다 클 때만 총 피해량을 별도 괄호로 표시
      if (hitsNum > 1) {
        const totalDamage = damageNum * hitsNum;
        totalDamageStr = ` (${totalDamage})`;
      }

      const finalDamageValue = `${damageStr}${hitsStr}${totalDamageStr}${totalDamageDiffStr}`;
      stats.unshift({ name: "피해량", value: finalDamageValue });
    }
  }

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

const CalculatedStats = ({ weapon, prevWeapon }) => {
  if (!weapon) return null;

  const parseValue = (str) => {
    if (!str) return [null, null];
    const num = parseFloat(str);
    return [isNaN(num) ? null : num, ""];
  };

  const [damageNum] = parseValue(weapon["피해량"]);
  const [hitsNum] = parseValue(weapon["타수"]);
  const [cooldownNum] = parseValue(weapon["쿨타임"]);
  const [manaNum] = parseValue(weapon["마나"]);

  const calculated = [];

  const totalDamage =
    damageNum !== null && hitsNum !== null ? damageNum * hitsNum : 0;

  // 이전 단계 값 파싱
  const [prevDamageNum] = parseValue(prevWeapon?.["피해량"]);
  const [prevHitsNum] = parseValue(prevWeapon?.["타수"]);
  const [prevCooldownNum] = parseValue(prevWeapon?.["쿨타임"]);
  const [prevManaNum] = parseValue(prevWeapon?.["마나"]);

  const prevTotalDamage =
    prevDamageNum !== null && prevHitsNum !== null
      ? prevDamageNum * prevHitsNum
      : 0;

  const getDiffString = (current, prev) => {
    if (prev === null || prev === undefined) return "";
    const diff = current - prev;
    if (diff !== 0 && !isNaN(diff)) {
      const sign = diff > 0 ? "+" : "";
      return ` (${sign}${diff.toFixed(2)})`;
    }
    return "";
  };

  // 1. 초당 피해량 (DPS)
  if (totalDamage > 0 && cooldownNum !== null && cooldownNum > 0) {
    const dps = totalDamage / cooldownNum;
    let dpsStr = dps.toFixed(2);

    if (
      prevTotalDamage > 0 &&
      prevCooldownNum !== null &&
      prevCooldownNum > 0
    ) {
      const prevDps = prevTotalDamage / prevCooldownNum;
      dpsStr += getDiffString(dps, prevDps);
    }
    calculated.push({ name: "초당 피해량 (DPS)", value: dpsStr });
  }

  // 2. 마나 효율
  if (totalDamage > 0 && manaNum !== null && manaNum > 0) {
    const manaEfficiency = totalDamage / manaNum;
    let manaEfficiencyStr = manaEfficiency.toFixed(2);

    if (prevTotalDamage > 0 && prevManaNum !== null && prevManaNum > 0) {
      const prevManaEfficiency = prevTotalDamage / prevManaNum;
      manaEfficiencyStr += getDiffString(manaEfficiency, prevManaEfficiency);
    }
    calculated.push({ name: "마나 효율", value: manaEfficiencyStr });
  }

  // 3. 초당 마나 소모량
  if (
    manaNum !== null &&
    manaNum > 0 &&
    cooldownNum !== null &&
    cooldownNum > 0
  ) {
    const manaPerSecond = manaNum / cooldownNum;
    let manaPerSecondStr = manaPerSecond.toFixed(2);

    if (
      prevManaNum !== null &&
      prevManaNum > 0 &&
      prevCooldownNum !== null &&
      prevCooldownNum > 0
    ) {
      const prevManaPerSecond = prevManaNum / prevCooldownNum;
      manaPerSecondStr += getDiffString(manaPerSecond, prevManaPerSecond);
    }
    calculated.push({
      name: "초당 마나 소모량",
      value: manaPerSecondStr,
    });
  }

  if (calculated.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableBody>
            {calculated.map((data, index) => (
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
    </Paper>
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

  // 이전 level에 해당하는 무기 데이터를 찾습니다.
  const prevWeapon =
    level > 0
      ? weaponLevels?.find((w) => parseInt(w["강화 차수"], 10) === level - 1)
      : null;

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

      <ReinforcementInfo
        weapon={weapon}
        prevWeapon={prevWeapon}
        level={level}
      />

      <CalculatedStats weapon={weapon} prevWeapon={prevWeapon} />

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
