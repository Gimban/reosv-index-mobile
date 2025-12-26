import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { CacheContext } from "../../../contexts/CacheContext";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import WeaponSelectionModal from "../../WeaponSelectionModal";
import * as styles from "./SpecialWeapon.styles";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

// EnhSim에서 사용하는 제외 목록과 동일하게 설정
const excludedNames = new Set([
  "서머 샤인",
  "오터먼트",
  "생명의 반지",
  "플레임",
  "실바니아",
  "산타 스태프",
  "섀도우 소드",
  "섀도우 대거",
]);
const excludedGrades = new Set([]);

let idCounter = 0;
const MAX_ITEMS = 15;

const SpecialWeaponItem = React.memo(
  ({
    item,
    index,
    onRemove,
    onChange,
    onOpenModal,
    getEnhancementsForWeapon,
    calculateStats,
    isDuplicate,
    isRemoveDisabled,
  }) => {
    const { dps, mps } = useMemo(
      () => calculateStats(item.name, item.enh),
      [item.name, item.enh, calculateStats]
    );

    const enhancements = useMemo(
      () => getEnhancementsForWeapon(item.name),
      [item.name, getEnhancementsForWeapon]
    );

    return (
      <Grid item>
        <Paper sx={styles.itemPaper} elevation={2}>
          <Box sx={styles.itemHeader}>
            <Typography variant="h6">무기 #{index + 1}</Typography>
            <IconButton
              onClick={() => onRemove(item.id)}
              disabled={isRemoveDisabled}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControl sx={{ width: { xs: "100%", sm: "70%" } }}>
              <Button
                variant="outlined"
                onClick={() => onOpenModal(item.id)}
                sx={{ justifyContent: "flex-start", height: "56px" }}
              >
                {item.name || "무기 선택"}
              </Button>
            </FormControl>
            <FormControl
              sx={{ width: { xs: "100%", sm: "30%" } }}
              disabled={!item.name}
            >
              <InputLabel>강화 차수</InputLabel>
              <Select
                value={item.name ? item.enh : ""}
                label="강화 차수"
                onChange={(e) => onChange(item.id, "enh", e.target.value)}
              >
                {enhancements.map((enhLevel) => (
                  <MenuItem key={enhLevel} value={enhLevel}>
                    +{enhLevel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {isDuplicate && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              * 중복된 무기입니다. 강화 수치가 가장 높은 항목만 적용됩니다.
            </Typography>
          )}
          <Box sx={styles.statsBox}>
            <Typography>DPS: {dps.toFixed(2)}</Typography>
            <Typography>초당 마나: {mps.toFixed(2)}</Typography>
          </Box>
        </Paper>
      </Grid>
    );
  }
);

const SpecialWeapon = () => {
  const navigate = useNavigate();
  const { cache, setCacheValue } = useContext(CacheContext);
  const { dpsState, updateDpsState } = useDpsCalc();
  const { weapons: allWeaponsData } = cache;
  const [loading, setLoading] = useState(!allWeaponsData);
  const [error, setError] = useState(null);

  const [items, setItems] = useState(() => {
    if (dpsState.specialWeapons && dpsState.specialWeapons.length > 0) {
      const maxId = Math.max(...dpsState.specialWeapons.map((item) => item.id));
      if (maxId >= idCounter) {
        idCounter = maxId + 1;
      }
      return dpsState.specialWeapons;
    }
    return [{ id: idCounter++, name: "", enh: 0 }];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (cache.weapons) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
          throw new Error("데이터를 가져오는 데 실패했습니다.");
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.filter(
              (row) => row["이름"] && row["이름"].trim() !== ""
            );
            setCacheValue("weapons", parsedData);
            setLoading(false);
          },
          error: (err) => {
            throw new Error(err.message);
          },
        });
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [cache.weapons, setCacheValue]);

  // 아이템 목록이 변경될 때마다 전역 상태를 업데이트합니다.
  useEffect(() => {
    updateDpsState("specialWeapons", items);
  }, [items, updateDpsState]);

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
      data[name].enhancements.push(enh);
      data[name].byEnhancement[enh] = w;
    });

    Object.values(data).forEach((entry) => {
      entry.enhancements.sort((a, b) => a - b);
    });

    return data;
  }, [allWeaponsData]);

  const getEnhancementsForWeapon = useCallback(
    (weaponName) => {
      if (!processedWeaponData[weaponName]) return [];
      return processedWeaponData[weaponName].enhancements;
    },
    [processedWeaponData]
  );

  const calculateStats = useCallback(
    (weaponName, enhancement) => {
      const weaponData = processedWeaponData[weaponName];
      if (!weaponData) {
        return { dps: 0, mps: 0 };
      }

      const weapon = weaponData.byEnhancement[enhancement];

      if (!weapon) {
        return { dps: 0, mps: 0 };
      }

      const parseValue = (str) => {
        if (!str) return null;
        const num = parseFloat(str);
        return isNaN(num) ? null : num;
      };

      const damage = parseValue(weapon["피해량"]);
      const hits = parseValue(weapon["타수"]);
      const cooldown = parseValue(weapon["쿨타임"]);
      const mana = parseValue(weapon["마나"]);

      const totalDamage = damage !== null && hits !== null ? damage * hits : 0;
      const dps = totalDamage > 0 && cooldown > 0 ? totalDamage / cooldown : 0;
      const mps = mana > 0 && cooldown > 0 ? mana / cooldown : 0;

      return { dps, mps };
    },
    [processedWeaponData]
  );

  const handleItemChange = useCallback(
    (id, field, value) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };
            if (field === "name") {
              const weaponData = processedWeaponData[value];
              updatedItem.enh =
                weaponData && weaponData.enhancements.length > 0
                  ? weaponData.enhancements[0]
                  : 0;
            }
            return updatedItem;
          }
          return item;
        })
      );
    },
    [processedWeaponData]
  );

  const handleAddItem = useCallback(() => {
    setItems((prevItems) => {
      if (prevItems.length < MAX_ITEMS) {
        return [...prevItems, { id: idCounter++, name: "", enh: 0 }];
      }
      return prevItems;
    });
  }, []);

  const handleRemoveItem = useCallback((id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const handleOpenModal = useCallback((itemId) => {
    setActiveItemId(itemId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveItemId(null);
  }, []);

  const handleWeaponSelect = useCallback(
    (weaponName) => {
      if (activeItemId !== null) {
        handleItemChange(activeItemId, "name", weaponName);
      }
      handleCloseModal();
    },
    [activeItemId, handleItemChange, handleCloseModal]
  );

  const handleConfirm = () => {
    navigate("/dps_calc");
  };

  const nameCounts = useMemo(() => {
    const nameCounts = items.reduce((acc, item) => {
      if (item.name) {
        acc[item.name] = (acc[item.name] || 0) + 1;
      }
      return acc;
    }, {});
    return nameCounts;
  }, [items]);

  const totalStats = useMemo(() => {
    const uniqueItems = {};
    items.forEach((item) => {
      if (!item.name) return;

      if (!uniqueItems[item.name] || item.enh > uniqueItems[item.name].enh) {
        uniqueItems[item.name] = item;
      }
    });

    const finalItems = Object.values(uniqueItems);

    return finalItems.reduce(
      (acc, item) => {
        const { dps, mps } = calculateStats(item.name, item.enh);
        acc.totalDps += dps;
        acc.totalMps += mps;
        return acc;
      },
      { totalDps: 0, totalMps: 0 }
    );
  }, [items, calculateStats]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>무기 목록을 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <Typography color="error">오류: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        특수 무기 DPS 계산
      </Typography>

      <Grid container direction="column" spacing={2}>
        {items.map((item, index) => (
          <SpecialWeaponItem
            key={item.id}
            item={item}
            index={index}
            onRemove={handleRemoveItem}
            onChange={handleItemChange}
            onOpenModal={handleOpenModal}
            getEnhancementsForWeapon={getEnhancementsForWeapon}
            calculateStats={calculateStats}
            isDuplicate={item.name ? nameCounts[item.name] > 1 : false}
            isRemoveDisabled={items.length <= 1}
          />
        ))}
      </Grid>

      <Button
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddItem}
        disabled={items.length >= MAX_ITEMS}
        sx={{ mt: 2 }}
      >
        항목 추가
      </Button>

      <Divider sx={{ my: 3 }} />

      <Paper sx={styles.totalStatsPaper} elevation={3}>
        <Typography variant="h6">종합 능력치</Typography>
        <Typography>총 DPS: {totalStats.totalDps.toFixed(2)}</Typography>
        <Typography>
          총 초당 마나 소모: {totalStats.totalMps.toFixed(2)}
        </Typography>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleConfirm}
      >
        확인
      </Button>

      <WeaponSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onWeaponSelect={handleWeaponSelect}
        weaponsData={allWeaponsData}
        excludedNames={excludedNames}
        excludedGrades={excludedGrades}
      />
    </Box>
  );
};

export default SpecialWeapon;
