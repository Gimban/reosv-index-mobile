import React, { useState, useEffect, useContext, useMemo } from "react";
import Papa from "papaparse";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CacheContext } from "../../../contexts/CacheContext";
import WeaponSelectionModal from "../../WeaponSelectionModal";
import * as styles from "./SpecialWeapon.styles";

// Weapons.js와 동일한 Google Sheet 정보를 사용합니다.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const WEAPONS_GID = "0";
const GUARANTEED_ENH_GID = "2088796296"; // 확정 강화 비용 시트 GID
const PROB_ENH_GID = "665507476"; // 확률 강화 비용 시트 GID

const WEAPONS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${WEAPONS_GID}`;
const GUARANTEED_ENH_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GUARANTEED_ENH_GID}`;
const PROB_ENH_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${PROB_ENH_GID}`;

// 무기 이미지 로드
const images = require.context(
  "../../../assets/images/weapons",
  false,
  /\.(png|jpe?g|svg|webp)$/
);

const weaponImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

const SIM_STATE_CACHE_KEY = "specialWeaponEnhSimState";

// 하드코딩으로 제외할 무기 이름 목록
const excludedNames = new Set([
  "방랑자, 플레탄",
  "서머 샤인",
  "오터먼트",
  "생명의 반지",
  "플레임",
  "실바니아",
  "산타 스태프",
  "섀도우 소드",
  "섀도우 대거",
]);

// 하드코딩으로 제외할 무기 등급 목록
const excludedGrades = new Set(["보스", "운명", "기타"]);

export default function SpecialWeapon() {
  const { cache, setCacheValue } = useContext(CacheContext);
  const { weapons: allWeaponsData } = cache;
  const [guaranteedEnhCosts, setGuaranteedEnhCosts] = useState([]);
  const [probEnhCosts, setProbEnhCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialTotalCosts = {
    gold: 0,
    formlessShards: 0,
    refinedStones: 0,
    rawOres: 0,
    purplePowder: 0,
    yellowPowder: 0,
    consumedWeapons: {},
  };

  // useState의 지연 초기화(lazy initial state)를 사용하여 sessionStorage에서 totalCosts를 한 번만 읽어옵니다.
  const [selectedWeaponName, setSelectedWeaponName] = useState(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(SIM_STATE_CACHE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        return savedState.selectedWeaponName || "";
      }
    } catch (error) {
      console.error(
        "Failed to parse selectedWeaponName from sessionStorage",
        error
      );
    }
    return "";
  });

  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(SIM_STATE_CACHE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        return savedState.currentLevel || 0;
      }
    } catch (error) {
      console.error("Failed to parse currentLevel from sessionStorage", error);
    }
    return 0;
  });

  const [totalCosts, setTotalCosts] = useState(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(SIM_STATE_CACHE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.totalCosts) {
          // 호환성을 위해 consumedWeapons가 객체인지 확인
          if (
            typeof savedState.totalCosts.consumedWeapons !== "object" ||
            savedState.totalCosts.consumedWeapons === null
          ) {
            savedState.totalCosts.consumedWeapons = {};
          }
          return savedState.totalCosts;
        }
      }
    } catch (error) {
      console.error("Failed to parse totalCosts from sessionStorage", error);
    }
    // 저장된 값이 없거나 오류 발생 시 초기값 반환
    return initialTotalCosts;
  });

  const [skipMenuAnchorEl, setSkipMenuAnchorEl] = useState(null);
  const [isFallPreventionOn, setIsFallPreventionOn] = useState(false);
  const [isResetPreventionOn, setIsResetPreventionOn] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    message: "",
  });

  // 데이터 로드 후, 저장된 무기 이름이 유효하지 않으면 초기화
  useEffect(() => {
    if (!allWeaponsData || !selectedWeaponName) return;

    const nameCounts = allWeaponsData.reduce((acc, w) => {
      const name = w["이름"];
      if (name) {
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {});

    const isEnhanceable = (name) => nameCounts[name] > 1;

    const getBaseWeaponData = (name) => {
      return (
        allWeaponsData.find(
          (w) => w["이름"] === name && parseInt(w["강화 차수"], 10) === 0
        ) || allWeaponsData.find((w) => w["이름"] === name)
      );
    };

    const weapon = getBaseWeaponData(selectedWeaponName);

    if (
      !weapon ||
      !isEnhanceable(selectedWeaponName) ||
      excludedNames.has(selectedWeaponName) ||
      excludedGrades.has(weapon["등급"])
    ) {
      setSelectedWeaponName("");
    }
  }, [allWeaponsData, selectedWeaponName]);

  // 상태 변경 시 sessionStorage에 저장
  useEffect(() => {
    const stateToSave = { selectedWeaponName, currentLevel, totalCosts };
    sessionStorage.setItem(SIM_STATE_CACHE_KEY, JSON.stringify(stateToSave));
  }, [selectedWeaponName, currentLevel, totalCosts]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const fetchAndParse = async (url, cacheKey) => {
        if (cache[cacheKey]) {
          return cache[cacheKey];
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`'${cacheKey}' 데이터를 가져오는 데 실패했습니다.`);
        }
        const csvText = await response.text();
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data.filter((row) =>
                Object.values(row).some((val) => val && val.trim() !== "")
              );
              setCacheValue(cacheKey, data);
              resolve(data);
            },
            error: (err) => reject(new Error(err.message)),
          });
        });
      };

      try {
        const [, guaranteedData, probData] = await Promise.all([
          fetchAndParse(WEAPONS_SHEET_URL, "weapons"),
          fetchAndParse(GUARANTEED_ENH_URL, "guaranteedEnhCosts"),
          fetchAndParse(PROB_ENH_URL, "probEnhCosts"),
        ]);

        setGuaranteedEnhCosts(guaranteedData);
        setProbEnhCosts(probData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (!allWeaponsData) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [cache, setCacheValue, allWeaponsData]);

  const selectedWeaponData = useMemo(() => {
    if (!selectedWeaponName || !allWeaponsData) return null;
    return (
      allWeaponsData.find(
        (w) =>
          w["이름"] === selectedWeaponName && parseInt(w["강화 차수"], 10) === 0
      ) || allWeaponsData.find((w) => w["이름"] === selectedWeaponName)
    );
  }, [allWeaponsData, selectedWeaponName]);

  const availableEnhancementLevels = useMemo(() => {
    if (!selectedWeaponName || !allWeaponsData) return [];
    return allWeaponsData
      .filter((w) => w["이름"] === selectedWeaponName)
      .map((w) => parseInt(w["강화 차수"], 10))
      .filter((level) => !isNaN(level))
      .sort((a, b) => a - b);
  }, [allWeaponsData, selectedWeaponName]);

  const handleSkipMenuOpen = (event) => {
    setSkipMenuAnchorEl(event.currentTarget);
  };
  const handleSkipMenuClose = () => setSkipMenuAnchorEl(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const guaranteedEnhCost = useMemo(() => {
    if (!selectedWeaponData) return null;

    const nextLevel = currentLevel + 1;
    return guaranteedEnhCosts.find(
      (cost) =>
        cost["등급"] === selectedWeaponData["등급"] &&
        parseInt(cost["강화 차수"], 10) === nextLevel
    );
  }, [selectedWeaponData, currentLevel, guaranteedEnhCosts]);

  const probEnhCost = useMemo(() => {
    if (!selectedWeaponData) return null;

    const nextLevel = currentLevel + 1;
    return probEnhCosts.find(
      (cost) =>
        cost["등급"] === selectedWeaponData["등급"] &&
        parseInt(cost["강화 차수"], 10) === nextLevel
    );
  }, [selectedWeaponData, currentLevel, probEnhCosts]);

  const displayProbabilities = useMemo(() => {
    if (!probEnhCost) return null;

    let success = parseFloat(probEnhCost["성공 확률"]) || 0;
    let maintain = parseFloat(probEnhCost["실패 확률"]) || 0;
    let fall = parseFloat(probEnhCost["하락 확률"]) || 0;
    let reset = parseFloat(probEnhCost["리셋 확률"]) || 0;

    if (isFallPreventionOn) {
      const reducedSuccess = success / 2;
      maintain += reducedSuccess; // 감소한 성공 확률만큼 유지 확률 증가
      maintain += fall; // 기존 하락 확률을 유지 확률에 더함
      success = reducedSuccess; // 성공 확률 절반으로 감소
      fall = 0; // 하락 확률은 0이 됨
    }

    return {
      success,
      maintain,
      fall,
      reset,
    };
  }, [probEnhCost, isFallPreventionOn]);

  const handleWeaponSelect = (name) => {
    setSelectedWeaponName(name);
    setCurrentLevel(0); // 무기 선택 시 강화 레벨 초기화
    handleCloseModal();
  };

  // 무기가 바뀌면 방지 옵션 초기화
  useEffect(() => {
    setIsFallPreventionOn(false);
    setIsResetPreventionOn(false);
  }, [selectedWeaponName]);

  // 강화 레벨이 바뀔 때, 사용 불가능해진 방지 옵션만 초기화
  useEffect(() => {
    const nextProbEnhCost = probEnhCosts.find(
      (cost) =>
        cost["등급"] === selectedWeaponData?.["등급"] &&
        parseInt(cost["강화 차수"], 10) === currentLevel + 1
    );

    if (!(parseFloat(nextProbEnhCost?.["하락 확률"]) > 0))
      setIsFallPreventionOn(false);
    if (!(parseFloat(nextProbEnhCost?.["리셋 확률"]) > 0))
      setIsResetPreventionOn(false);
  }, [currentLevel, probEnhCosts, selectedWeaponData]);

  const handleGuaranteedEnhance = () => {
    if (!guaranteedEnhCost) return;

    const goldCost = parseInt(guaranteedEnhCost["골드"], 10) || 0;
    const shardCost = parseInt(guaranteedEnhCost["무형의 파편"], 10) || 0;

    setTotalCosts((prev) => ({
      ...prev,
      gold: prev.gold + goldCost,
      formlessShards: prev.formlessShards + shardCost,
      // 확정 강화는 다른 재화를 소모하지 않으므로 나머지는 그대로 유지
    }));

    setCurrentLevel((prev) => prev + 1);
  };

  const handleProbEnhance = () => {
    if (!probEnhCost) return;

    let goldCost = parseInt(probEnhCost["골드"], 10) || 0;
    const refinedStoneCost = parseInt(probEnhCost["정교한 강화석"], 10) || 0;
    const rawOreCost = parseInt(probEnhCost["미가공 강화 원석"], 10) || 0;

    let successRate = parseFloat(probEnhCost["성공 확률"]) || 0;
    let fallRate = parseFloat(probEnhCost["하락 확률"]) || 0; // '하락 확률' 열을 사용
    const resetRate = parseFloat(probEnhCost["리셋 확률"]) || 0;
    // '실패 확률'은 이제 '유지 확률'을 의미합니다.
    // let failAndMaintainRate = parseFloat(probEnhCost["실패 확률"]) || 0;

    if (isFallPreventionOn) {
      goldCost += parseInt(probEnhCost["하락 방지 비용"], 10) || 0;

      const reducedSuccessRate = successRate / 2;
      // failAndMaintainRate += reducedSuccessRate; // 감소한 성공 확률만큼 실패(유지) 확률 증가
      // failAndMaintainRate += fallRate; // 기존 하락 확률을 실패(유지) 확률에 더함
      successRate = reducedSuccessRate; // 성공 확률 절반으로 감소
      fallRate = 0; // 하락 확률은 0이 됨
    }
    if (isResetPreventionOn) {
      goldCost += parseInt(probEnhCost["리셋 방지 비용"], 10) || 0;
    }

    // 리셋 방지 시 추가 아이템 소모량 계산을 위한 함수
    const getPowderCostByLevel = (level) => {
      if (level >= 7 && level <= 9) return 1;
      if (level >= 10 && level <= 12) return 2;
      if (level >= 13 && level <= 15) return 3;
      return 0;
    };

    const rand = Math.random();
    let resultMessage = "";
    let additionalCosts = {
      gold: goldCost,
      refinedStones: refinedStoneCost,
      rawOres: rawOreCost,
      purplePowder: 0,
      yellowPowder: 0,
    };

    if (rand < successRate) {
      // 성공
      setCurrentLevel((prev) => prev + 1);
      resultMessage = `강화 성공! (+${currentLevel + 1})`;
    } else if (rand < successRate + fallRate) {
      // 성공 확률 다음은 하락 확률 구간
      // 실패 (하락)
      if (!isFallPreventionOn) {
        setCurrentLevel((prev) => Math.max(0, prev - 1));
        resultMessage = `강화 실패... (${
          currentLevel > 0 ? `+${currentLevel - 1}로 하락` : "변동 없음"
        })`;
      } else {
        resultMessage = "강화 실패! (하락 방지됨)";
      }
    } else if (rand < successRate + fallRate + resetRate) {
      // 그 다음은 리셋 확률 구간
      // 리셋
      if (!isResetPreventionOn) {
        setCurrentLevel(0);
        resultMessage = "강화 리셋... (+0)";
      } else {
        // 리셋 방지가 실제로 적용되었을 때 추가 아이템 소모
        const weaponGrade = selectedWeaponData["등급"];
        let additionalResultMessage = "";

        if (weaponGrade === "필멸") {
          // 이 비용은 setTotalCosts에서 직접 처리
          additionalResultMessage = " (동일 무기 1개 소모)";
        } else if (weaponGrade === "영웅" || weaponGrade === "전설") {
          const powderCost = getPowderCostByLevel(currentLevel); // 현재 레벨 기준
          if (powderCost > 0) {
            if (weaponGrade === "영웅") {
              additionalCosts.purplePowder += powderCost;
              additionalResultMessage = ` (보라색 가루 ${powderCost}개 소모)`;
            } else {
              additionalCosts.yellowPowder += powderCost;
              additionalResultMessage = ` (노란색 가루 ${powderCost}개 소모)`;
            }
          }
        }

        resultMessage = `강화 실패! (리셋 방지됨)${additionalResultMessage}`;
      }
    } else {
      // 나머지는 모두 유지 구간
      // 유지
      resultMessage = "강화 실패! (등급 유지)";
    }

    setTotalCosts((prev) => ({
      ...prev,
      gold: prev.gold + additionalCosts.gold,
      refinedStones: prev.refinedStones + additionalCosts.refinedStones,
      rawOres: prev.rawOres + additionalCosts.rawOres,
      purplePowder: prev.purplePowder + additionalCosts.purplePowder,
      yellowPowder: prev.yellowPowder + additionalCosts.yellowPowder,
      consumedWeapons:
        resultMessage.includes("리셋 방지됨") &&
        selectedWeaponData["등급"] === "필멸"
          ? {
              ...(prev.consumedWeapons || {}),
              [selectedWeaponName]:
                ((prev.consumedWeapons &&
                  prev.consumedWeapons[selectedWeaponName]) ||
                  0) + 1,
            }
          : prev.consumedWeapons,
    }));

    setSnackbarInfo({ open: true, message: resultMessage });
  };

  const handleSkipToLevel = (targetLevel) => {
    // 건너뛰기 시에는 재화를 누적하지 않고 레벨만 변경합니다.
    setCurrentLevel(targetLevel);

    handleSkipMenuClose();
  };

  const handleResetCosts = () => {
    setTotalCosts(initialTotalCosts);
    setCurrentLevel(0);
    setSnackbarInfo({ open: true, message: "누적 재화가 초기화되었습니다." });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarInfo({ ...snackbarInfo, open: false });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">오류: {error}</Typography>;

  return (
    <Box sx={{ mb: 2 }}>
      <Button variant="contained" onClick={handleOpenModal} fullWidth>
        {selectedWeaponName || "무기 선택"}
      </Button>

      <WeaponSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onWeaponSelect={handleWeaponSelect}
        weaponsData={allWeaponsData}
        excludedNames={excludedNames}
        excludedGrades={excludedGrades}
      />

      {selectedWeaponData && (
        <Paper elevation={3} sx={{ ...styles.selectedWeaponPaper, mt: 2 }}>
          <Box
            component="img"
            src={weaponImages[`${selectedWeaponData["이미지 파일"]}.webp`]}
            alt={selectedWeaponData["이름"]}
            sx={styles.weaponImage}
          />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" sx={styles.weaponName} noWrap>
              {selectedWeaponData["이름"]}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              등급: {selectedWeaponData["등급"]}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
              <Typography variant="h6">+{currentLevel} 강화</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSkipMenuOpen}
                endIcon={<ArrowForwardIosIcon />}
                sx={{ flexShrink: 0, ml: "auto" }}
              >
                건너뛰기
              </Button>
              <Menu
                anchorEl={skipMenuAnchorEl}
                open={Boolean(skipMenuAnchorEl)}
                onClose={handleSkipMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {availableEnhancementLevels.map((level) => (
                  <MenuItem
                    key={level}
                    onClick={() => handleSkipToLevel(level)}
                  >
                    +{level} 강화
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Paper>
      )}

      {selectedWeaponData && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* 확정 강화 */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" gutterBottom>
                확정 강화
              </Typography>
              {guaranteedEnhCost ? (
                <>
                  <Typography variant="body2">
                    골드: {Number(guaranteedEnhCost["골드"]).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    무형의 파편:{" "}
                    {Number(guaranteedEnhCost["무형의 파편"]).toLocaleString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={handleGuaranteedEnhance}
                  >
                    강화
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  정보 없음
                </Typography>
              )}
            </Box>

            {/* 확률 강화 */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" gutterBottom>
                확률 강화
              </Typography>
              {probEnhCost ? (
                <>
                  <Typography variant="body2">
                    골드: {Number(probEnhCost["골드"]).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    정교한 강화석:{" "}
                    {Number(probEnhCost["정교한 강화석"]).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    미가공 강화 원석:{" "}
                    {Number(probEnhCost["미가공 강화 원석"]).toLocaleString()}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {displayProbabilities?.success > 0 && (
                      <Typography variant="caption">
                        성공: {(displayProbabilities.success * 100).toFixed(1)}%
                      </Typography>
                    )}
                    {displayProbabilities?.maintain > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        실패: {(displayProbabilities.maintain * 100).toFixed(1)}
                        %
                      </Typography>
                    )}
                    {displayProbabilities?.fall > 0 && (
                      <Typography variant="caption" color="error">
                        하락: {(displayProbabilities.fall * 100).toFixed(1)}%
                      </Typography>
                    )}
                    {displayProbabilities?.reset > 0 && (
                      <Typography variant="caption" color="error">
                        리셋: {(displayProbabilities.reset * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={handleProbEnhance}
                  >
                    강화
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mt: 1,
                      gap: 1,
                    }}
                  >
                    {parseFloat(probEnhCost["하락 확률"]) > 0 && (
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isFallPreventionOn}
                              onChange={(e) =>
                                setIsFallPreventionOn(e.target.checked)
                              }
                              size="small"
                            />
                          }
                          label="하락 방지"
                        />
                        <Typography variant="caption" display="block">
                          비용:{" "}
                          {Number(
                            probEnhCost["하락 방지 비용"]
                          ).toLocaleString()}{" "}
                          골드
                        </Typography>
                      </Box>
                    )}
                    {parseFloat(probEnhCost["리셋 확률"]) > 0 && (
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isResetPreventionOn}
                              onChange={(e) =>
                                setIsResetPreventionOn(e.target.checked)
                              }
                              size="small"
                            />
                          }
                          label="리셋 방지"
                        />
                        <Typography variant="caption" display="block">
                          비용:{" "}
                          {Number(
                            probEnhCost["리셋 방지 비용"]
                          ).toLocaleString()}{" "}
                          골드 +{" "}
                          {(() => {
                            const grade = selectedWeaponData["등급"];
                            const level = currentLevel; // 현재 레벨 기준
                            if (grade === "필멸") return "동일 무기 1개";
                            if (grade === "영웅") {
                              const cost =
                                level >= 7 && level <= 9
                                  ? 1
                                  : level >= 10 && level <= 12
                                  ? 2
                                  : 3;
                              return `보라색 가루 ${cost}개`;
                            }
                            if (grade === "전설") {
                              const cost =
                                level >= 7 && level <= 9
                                  ? 1
                                  : level >= 10 && level <= 12
                                  ? 2
                                  : 3;
                              return `노란색 가루 ${cost}개`;
                            }
                          })()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  정보 없음
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {selectedWeaponData &&
        (totalCosts.gold > 0 ||
          totalCosts.formlessShards > 0 ||
          totalCosts.refinedStones > 0 ||
          totalCosts.rawOres > 0 ||
          totalCosts.purplePowder > 0 ||
          totalCosts.yellowPowder > 0 ||
          (totalCosts.consumedWeapons &&
            Object.keys(totalCosts.consumedWeapons).length > 0)) && (
          <Paper elevation={3} sx={{ p: 2, mt: 2, position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6">누적 소모 재화</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetCosts}
              >
                초기화
              </Button>
            </Box>
            <Typography>골드: {totalCosts.gold.toLocaleString()}</Typography>
            <Typography>
              무형의 파편: {totalCosts.formlessShards.toLocaleString()}
            </Typography>
            <Typography>
              정교한 강화석: {totalCosts.refinedStones.toLocaleString()}
            </Typography>
            <Typography>
              미가공 강화 원석: {totalCosts.rawOres.toLocaleString()}
            </Typography>
            {totalCosts.purplePowder > 0 && (
              <Typography>
                보라색 가루: {totalCosts.purplePowder.toLocaleString()}
              </Typography>
            )}
            {totalCosts.yellowPowder > 0 && (
              <Typography>
                노란색 가루: {totalCosts.yellowPowder.toLocaleString()}
              </Typography>
            )}
            {totalCosts.consumedWeapons &&
              Object.entries(totalCosts.consumedWeapons).map(
                ([name, count]) => (
                  <Typography key={name}>
                    소모된 {name}: {count.toLocaleString()}개
                  </Typography>
                )
              )}
          </Paper>
        )}

      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarInfo.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
