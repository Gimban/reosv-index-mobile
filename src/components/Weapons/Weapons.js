import React, { useState, useEffect, useContext } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { CacheContext } from "../../contexts/CacheContext"; // CacheContext import
import * as styles from "./Weapons.styles";

// 본인의 구글 시트 ID로 교체하세요. GID는 0을 사용합니다.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

// src/assets/images/weapons 디렉토리의 모든 이미지를 불러옵니다.
// 이 디렉토리를 만들고 무기 이미지를 여기에 저장해야 합니다.
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

export default function Weapons() {
  const { cache, setCacheValue } = useContext(CacheContext);
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // 캐시에 'weapons' 데이터가 있는지 확인
      if (cache.weapons) {
        // 캐시된 데이터(모든 행 포함)에서 중복을 제거하여 목록에 표시합니다.
        const seen = new Set();
        const uniqueWeaponsForDisplay = cache.weapons.filter((row) => {
          const name = row["이름"];
          if (name && !seen.has(name)) {
            seen.add(name);
            return true;
          }
          return false;
        });

        setWeapons(uniqueWeaponsForDisplay);
        setLoading(false);
        return; // 데이터가 있으면 fetch를 실행하지 않고 종료
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
            const allWeaponsData = results.data.filter(
              (row) => row["이름"] && row["이름"].trim() !== ""
            );

            const seen = new Set();
            const uniqueWeaponsForDisplay = allWeaponsData.filter((row) => {
              const name = row["이름"];
              if (!seen.has(name)) {
                seen.add(name);
                return true;
              }
              return false;
            });
            setWeapons(uniqueWeaponsForDisplay);
            setCacheValue("weapons", allWeaponsData); // 모든 행 데이터를 캐시에 저장
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

  const getWeaponNameStyle = (name) => {
    // 이름 길이에 따라 폰트 크기를 동적으로 조절합니다.
    if (name && name.length > 8) {
      return { ...styles.weaponName, fontSize: "0.875rem" };
    }
    return styles.weaponName;
  };

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
    <Container sx={styles.container}>
      <Typography variant="h5" gutterBottom>
        특수 무기 목록
      </Typography>
      <Box sx={styles.gridContainer}>
        {weapons.map((weapon, index) => (
          <Link
            to={`/weapons/${weapon["이름"].replace(/ /g, "_")}`}
            key={index}
            style={{ textDecoration: "none" }}
          >
            <Card sx={styles.card(weapon["등급"])}>
              <CardMedia
                component="img"
                sx={styles.cardImage}
                image={weaponImages[`${weapon["이미지 파일"]}.webp`]}
                alt={weapon["이름"]}
              />
              <CardContent sx={styles.cardContent}>
                <Typography
                  variant="subtitle1"
                  sx={getWeaponNameStyle(weapon["이름"])}
                >
                  {weapon["이름"]}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
