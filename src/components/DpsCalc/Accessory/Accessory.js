import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Modal,
  Card,
  Divider,
  TextField,
  CardActionArea,
  CardMedia,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as styles from "./Accessory.styles";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import { CacheContext } from "../../../contexts/CacheContext";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
// TODO: 실제 장신구 데이터 시트의 GID로 변경해야 합니다.
const GID_1 = "1577464411"; // 장신구 기본 옵션
const GID_2 = "2032806807"; // 장신구 잠재 옵션

const SHEET_URL_1 = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID_1}`;
const SHEET_URL_2 = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID_2}`;

// 장신구 이미지 로드
const images = require.context(
  "../../../assets/images/accessories",
  false,
  /\.(png|jpe?g|svg|webp)$/
);

const accessoryImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

const ACCESSORY_SLOTS = [
  { id: "pendant", label: "팬던트", part: "팬던트" },
  { id: "earring", label: "귀걸이", part: "귀걸이" },
  { id: "bracelet", label: "팔찌", part: "팔찌" },
  { id: "ring1", label: "반지 1", part: "반지" },
  { id: "ring2", label: "반지 2", part: "반지" },
];

const OPTION_TYPES = ["일반", "고급", "희귀", "영웅"];
const POTENTIAL_GRADES = ["없음", "일반", "고급", "희귀", "영웅"];
const VALID_DPS_OPTIONS = new Set([
  "클래스 기본 공격 데미지 증가 +",
  "클래스 스킬 데미지 증가 %",
  "최종 데미지 스탯 증가 +",
  "체력 스탯 증가 +",
  "일반 몬스터 대상 데미지 증가 %",
  "보스 공격 시 대상 데미지 증가 %",
  "스킬 쿨타임 감소 %",
  "특수 무기 데미지 증가 %",
  "일반&고급 등급 무기 데미지 증가 %",
  "희귀 등급 무기 데미지 증가 %",
  "영웅 등급 무기 데미지 증가 %",
  "전설 등급 무기 데미지 증가 %",
  "전설&필멸 등급 무기 데미지 증가 %",
  "필멸 등급 무기 데미지 증가 %",
  "운명 등급 무기 데미지 증가 %",
  "최대 마나 증가 +",
  "최대 마나 증가 %",
  "마나 회복량 증가 +",
  "마나 회복량 증가 %",
]);

const FIXED_OPTIONS = {
  // 특정 장신구의 고정 옵션 값을 정의합니다.
  // 예시: "장신구 이름": { "옵션 이름": 고정값 }
  // "오우거의 펜던트": { "체력 스탯 증가 +": 1000 },
  "영원한 폭풍, 템페스트": {
    "운명 등급 무기 데미지 증가 %": 10.5,
    "최종 데미지 스탯 증가 +": 4,
    "스킬 쿨타임 감소 %": 7,
    "최대 체력 증가 +": 350,
  },
};

const Accessory = () => {
  const navigate = useNavigate();
  const { dpsState, updateDpsState } = useDpsCalc();
  const { cache, setCacheValue } = useContext(CacheContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(
    dpsState.accessories?.selectedItems || {}
  );
  const [accessoryOptions, setAccessoryOptions] = useState(
    dpsState.accessories?.accessoryOptions || {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [potentialState, setPotentialState] = useState(
    dpsState.accessories?.potentialState || {}
  );
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // 이미 캐시에 데이터가 있다면 로딩 생략
      if (cache.accessories) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 2개의 시트 데이터를 병렬로 요청
        const [response1, response2] = await Promise.all([
          fetch(SHEET_URL_1),
          fetch(SHEET_URL_2),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }

        const text1 = await response1.text();
        const text2 = await response2.text();

        const parseOptions = { header: true, skipEmptyLines: true };
        const data1 = Papa.parse(text1, parseOptions).data;
        const data2 = Papa.parse(text2, parseOptions).data;

        // 캐시에 저장 (두 시트의 데이터를 객체로 묶어서 저장)
        setCacheValue("accessories", { sheet1: data1, sheet2: data2 });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [cache.accessories, setCacheValue]);

  const getPotentialValue = useCallback(
    (optionName, grade) => {
      if (
        !cache.accessories?.sheet2 ||
        !optionName ||
        !grade ||
        grade === "없음"
      )
        return 0;
      const row = cache.accessories.sheet2.find(
        (r) => r["옵션"] === optionName
      );
      return row ? Number(row[grade]) || 0 : 0;
    },
    [cache.accessories]
  );

  const potentialOptionsList = useMemo(() => {
    if (!cache.accessories?.sheet2) return [];
    return cache.accessories.sheet2
      .map((row) => row["옵션"])
      .filter((opt) => opt && opt.trim() !== "");
  }, [cache.accessories]);

  const totalStats = useMemo(() => {
    const totals = {};

    // 1. 기본 및 추가 옵션
    Object.values(accessoryOptions).forEach((itemOptions) => {
      Object.entries(itemOptions).forEach(([optionName, value]) => {
        if (VALID_DPS_OPTIONS.has(optionName)) {
          totals[optionName] = (totals[optionName] || 0) + (Number(value) || 0);
        }
      });
    });

    // 2. 잠재 옵션
    Object.values(potentialState).forEach((slotPotential) => {
      if (
        slotPotential &&
        slotPotential.grade !== "없음" &&
        slotPotential.options
      ) {
        slotPotential.options.forEach((optionName) => {
          if (optionName && VALID_DPS_OPTIONS.has(optionName)) {
            const value = getPotentialValue(optionName, slotPotential.grade);
            totals[optionName] = (totals[optionName] || 0) + value;
          }
        });
      }
    });

    const finalTotals = {};
    Object.entries(totals).forEach(([key, value]) => {
      if (value !== 0) {
        finalTotals[key] = value;
      }
    });

    return finalTotals;
  }, [accessoryOptions, potentialState, getPotentialValue]);

  // 상태 변경 시 자동으로 전역 상태 업데이트
  useEffect(() => {
    updateDpsState("accessories", {
      selectedItems,
      accessoryOptions,
      potentialState,
      totalStats,
    });
  }, [
    selectedItems,
    accessoryOptions,
    potentialState,
    totalStats,
    updateDpsState,
  ]);

  const handlePotentialGradeChange = (slotId, grade) => {
    setPotentialState((prev) => ({
      ...prev,
      [slotId]: {
        grade,
        options:
          grade === "없음"
            ? [null, null, null]
            : prev[slotId]?.options || [null, null, null],
      },
    }));
  };

  const handlePotentialOptionChange = (slotId, index, optionName) => {
    setPotentialState((prev) => {
      const currentOptions = [...(prev[slotId]?.options || [null, null, null])];
      currentOptions[index] = optionName;
      return {
        ...prev,
        [slotId]: {
          ...(prev[slotId] || { grade: "없음" }),
          options: currentOptions,
        },
      };
    });
  };

  const handleSlotClick = (slot) => {
    setActiveSlot(slot);
    setIsModalOpen(true);
  };

  const handleItemSelect = (item) => {
    const slotId = activeSlot.id;
    setSelectedItems((prev) => ({ ...prev, [slotId]: item }));

    // 아이템 선택/해제 시 옵션 상태 업데이트
    setAccessoryOptions((prev) => {
      const newOptions = { ...prev };
      if (item) {
        // 새 아이템 선택 시 해당 슬롯의 옵션 초기화
        newOptions[slotId] = {};
        // 고정 옵션이 있는 경우 자동 적용
        const fixedOpts = FIXED_OPTIONS[item["보석"]];
        if (fixedOpts) {
          newOptions[slotId] = { ...fixedOpts };
        }
      } else {
        // 아이템 해제 시 해당 슬롯의 옵션 삭제
        delete newOptions[slotId];
        // 잠재 옵션도 삭제
        setPotentialState((prev) => {
          const newState = { ...prev };
          delete newState[slotId];
          return newState;
        });
      }
      return newOptions;
    });

    setIsModalOpen(false);
  };

  const handleOptionChange = (slotId, optionName, value) => {
    const numericValue = value === "" ? "" : Number(value);
    // 숫자 또는 빈 문자열이 아니면 업데이트하지 않음
    if (value !== "" && isNaN(numericValue)) {
      return;
    }

    setAccessoryOptions((prev) => ({
      ...prev,
      [slotId]: {
        ...(prev[slotId] || {}),
        [optionName]: numericValue,
      },
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>데이터 로딩 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Typography color="error">에러 발생: {error}</Typography>
        <Button variant="outlined" onClick={() => navigate("/dps_calc")}>
          뒤로 가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          장신구 설정
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate("/dps_calc")}>
            뒤로 가기
          </Button>
        </Box>
      </Box>

      <Box sx={styles.slotsContainer}>
        {ACCESSORY_SLOTS.map((slot) => {
          const selectedItem = selectedItems[slot.id];
          return (
            <Paper key={slot.id} sx={styles.slotItem} elevation={2}>
              <Box sx={styles.slotHeader} onClick={() => handleSlotClick(slot)}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {selectedItem && (
                    <Box
                      component="img"
                      src={
                        accessoryImages[`${selectedItem["이미지 파일"]}.webp`]
                      }
                      alt={selectedItem["보석"]}
                      sx={styles.selectedItemImage}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {slot.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedItem ? selectedItem["보석"] : "선택되지 않음"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {selectedItem && (
                <Box sx={styles.optionsContainer}>
                  <Divider />
                  {OPTION_TYPES.map((optionGrade) => {
                    const optionName = selectedItem[`${optionGrade} 옵션`];
                    if (!optionName) return null;

                    const isDpsOption = VALID_DPS_OPTIONS.has(optionName);
                    const isFixed =
                      FIXED_OPTIONS[selectedItem["보석"]]?.[optionName] !==
                      undefined;

                    return (
                      <Box key={optionGrade} sx={styles.optionRow}>
                        <Typography
                          variant="body2"
                          sx={{
                            ...(isDpsOption ? styles.dpsOptionLabel : {}),
                            flex: 1,
                            mr: 1,
                          }}
                        >
                          {optionName}
                        </Typography>
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          sx={{ width: "80px" }}
                          disabled={isFixed}
                          value={accessoryOptions[slot.id]?.[optionName] ?? ""}
                          onChange={(e) =>
                            handleOptionChange(
                              slot.id,
                              optionName,
                              e.target.value
                            )
                          }
                        />
                      </Box>
                    );
                  })}

                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    잠재 옵션
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>등급</InputLabel>
                    <Select
                      value={potentialState[slot.id]?.grade || "없음"}
                      label="등급"
                      onChange={(e) =>
                        handlePotentialGradeChange(slot.id, e.target.value)
                      }
                    >
                      {POTENTIAL_GRADES.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {potentialState[slot.id]?.grade &&
                    potentialState[slot.id].grade !== "없음" &&
                    [0, 1, 2].map((index) => {
                      const selectedOption =
                        potentialState[slot.id]?.options?.[index] || "";
                      const isDpsOption = VALID_DPS_OPTIONS.has(selectedOption);
                      const value = getPotentialValue(
                        selectedOption,
                        potentialState[slot.id]?.grade
                      );

                      return (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            gap: 1,
                            mb: 1,
                            alignItems: "center",
                          }}
                        >
                          <FormControl fullWidth size="small">
                            <InputLabel>옵션 {index + 1}</InputLabel>
                            <Select
                              value={selectedOption}
                              label={`옵션 ${index + 1}`}
                              onChange={(e) =>
                                handlePotentialOptionChange(
                                  slot.id,
                                  index,
                                  e.target.value
                                )
                              }
                              sx={
                                isDpsOption
                                  ? {
                                      color: "primary.main",
                                      fontWeight: "bold",
                                      "& .MuiSelect-select": {
                                        color: "primary.main",
                                        fontWeight: "bold",
                                      },
                                    }
                                  : {}
                              }
                            >
                              <MenuItem value="">
                                <em>선택 안 함</em>
                              </MenuItem>
                              {potentialOptionsList.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={
                                    VALID_DPS_OPTIONS.has(opt)
                                      ? {
                                          color: "primary.main",
                                          fontWeight: "bold",
                                        }
                                      : {}
                                  }
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: "40px",
                              textAlign: "right",
                              fontWeight: isDpsOption ? "bold" : "normal",
                              color: isDpsOption
                                ? "primary.main"
                                : "text.primary",
                            }}
                          >
                            {value > 0 ? `+${value}` : ""}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {Object.keys(totalStats).length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
            옵션 총합
          </Typography>
          <Divider />
          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "8px 16px",
              alignItems: "center",
            }}
          >
            {Object.entries(totalStats).map(([option, value]) => (
              <React.Fragment key={option}>
                <Typography variant="body2">{option}</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", textAlign: "right" }}
                >
                  {value > 0 ? "+" : ""}
                  {Number.isInteger(value) ? value : value.toFixed(2)}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/dps_calc")}
        sx={{ mt: 2 }}
      >
        확인
      </Button>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={styles.modalStyle}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {activeSlot?.label} 선택
          </Typography>
          <Box sx={styles.modalGrid}>
            <Card sx={styles.modalItemCard}>
              <CardActionArea
                onClick={() => handleItemSelect(null)}
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography sx={styles.modalItemName}>선택 안 함</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            {cache.accessories?.sheet1
              ?.filter((item) => item["부위"] === activeSlot?.part)
              .map((item, index) => (
                <Card key={index} sx={styles.modalItemCard}>
                  <CardActionArea
                    onClick={() => handleItemSelect(item)}
                    sx={{ height: "100%" }}
                  >
                    <CardMedia
                      component="img"
                      sx={styles.modalItemImage}
                      image={
                        accessoryImages[`${item["이미지 파일"]}.webp`] ||
                        "placeholder.png"
                      }
                      alt={item["보석"]}
                    />
                    <CardContent sx={{ p: 0 }}>
                      <Typography sx={styles.modalItemName}>
                        {item["보석"]}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Accessory;
