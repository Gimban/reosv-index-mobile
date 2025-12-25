import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
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
import * as styles from "./SpecialWeapon.styles";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

let idCounter = 0;
const MAX_ITEMS = 15;

const SpecialWeapon = () => {
  const { cache, setCacheValue } = useContext(CacheContext);
  const { weapons: allWeaponsData } = cache;
  const [loading, setLoading] = useState(!allWeaponsData);
  const [error, setError] = useState(null);

  const [items, setItems] = useState([{ id: idCounter++, name: "", enh: 0 }]);

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

  const uniqueWeapons = useMemo(() => {
    if (!allWeaponsData) return [];
    const seen = new Set();
    return allWeaponsData
      .map((w) => w["이름"])
      .filter((name) => {
        if (name && !seen.has(name)) {
          seen.add(name);
          return true;
        }
        return false;
      })
      .sort();
  }, [allWeaponsData]);

  const getEnhancementsForWeapon = (weaponName) => {
    if (!allWeaponsData || !weaponName) return [];
    return allWeaponsData
      .filter((w) => w["이름"] === weaponName)
      .map((w) => parseInt(w["강화 차수"], 10))
      .sort((a, b) => a - b);
  };

  const calculateStats = useCallback(
    (weaponName, enhancement) => {
      if (!allWeaponsData || !weaponName) {
        return { dps: 0, mps: 0 };
      }

      const weapon = allWeaponsData.find(
        (w) =>
          w["이름"] === weaponName &&
          parseInt(w["강화 차수"], 10) === enhancement
      );

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

      const totalDamage =
        damage !== null && hits !== null ? damage * hits : 0;
      const dps =
        totalDamage > 0 && cooldown > 0 ? totalDamage / cooldown : 0;
      const mps = mana > 0 && cooldown > 0 ? mana / cooldown : 0;

      return { dps, mps };
    },
    [allWeaponsData]
  );

  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "name") {
            updatedItem.enh = 0;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    if (items.length < MAX_ITEMS) {
      setItems([...items, { id: idCounter++, name: "", enh: 0 }]);
    }
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const { dps, mps } = calculateStats(item.name, item.enh);
      return { ...item, dps, mps };
    });
  }, [items, calculateStats]);

  const totalStats = useMemo(() => {
    return calculatedItems.reduce(
      (acc, item) => {
        acc.totalDps += item.dps;
        acc.totalMps += item.mps;
        return acc;
      },
      { totalDps: 0, totalMps: 0 }
    );
  }, [calculatedItems]);

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
        {calculatedItems.map((item, index) => (
          <Grid item key={item.id}>
            <Paper sx={styles.itemPaper} elevation={2}>
              <Box sx={styles.itemHeader}>
                <Typography variant="h6">무기 #{index + 1}</Typography>
                <IconButton
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>무기 선택</InputLabel>
                    <Select
                      value={item.name}
                      label="무기 선택"
                      onChange={(e) =>
                        handleItemChange(item.id, "name", e.target.value)
                      }
                    >
                      {uniqueWeapons.map((weaponName) => (
                        <MenuItem key={weaponName} value={weaponName}>
                          {weaponName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!item.name}>
                    <InputLabel>강화 차수</InputLabel>
                    <Select
                      value={item.enh}
                      label="강화 차수"
                      onChange={(e) =>
                        handleItemChange(item.id, "enh", e.target.value)
                      }
                    >
                      {getEnhancementsForWeapon(item.name).map((enhLevel) => (
                        <MenuItem key={enhLevel} value={enhLevel}>
                          +{enhLevel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={styles.statsBox}>
                <Typography>DPS: {item.dps.toFixed(2)}</Typography>
                <Typography>초당 마나: {item.mps.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
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

      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        확인
      </Button>
    </Box>
  );
};

export default SpecialWeapon;
