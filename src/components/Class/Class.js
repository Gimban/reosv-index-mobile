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
  Typography,
} from "@mui/material";
import { CacheContext } from "../../contexts/CacheContext";
import * as styles from "./Class.styles";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "1281476028";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

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

const getUniqueClasses = (classes) => {
  const seen = new Set();
  return classes.filter((row) => {
    const name = row["클래스"];
    if (name && !seen.has(name)) {
      seen.add(name);
      return true;
    }
    return false;
  });
};

export default function Class() {
  const { cache, setCacheValue } = useContext(CacheContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (cache.classes) {
        setClasses(getUniqueClasses(cache.classes));

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
            const allClassData = results.data.filter(
              (row) => row["클래스"] && row["클래스"].trim() !== ""
            );

            setCacheValue("classes", allClassData); // 전체 데이터를 캐시에 저장
            setClasses(getUniqueClasses(allClassData)); // 화면에는 고유 목록만 표시
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
  }, [cache.classes, setCacheValue]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          클래스 목록을 불러오는 중입니다...
        </Typography>
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

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography>표시할 클래스가 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Container sx={styles.container}>
      <Typography variant="h5" gutterBottom>
        클래스 목록
      </Typography>
      <Box sx={styles.gridContainer}>
        {classes.map((cls, index) => (
          <Link
            to={`/classes/${cls["클래스"].replace(/ /g, "_")}`}
            key={cls["클래스"] || index}
            style={{ textDecoration: "none" }}
          >
            <Card sx={styles.card(cls["클래스"])}>
              <CardMedia
                component="img"
                sx={styles.cardImage(cls["클래스"])}
                image={classImages[`${cls["ID"]}5.webp`]}
                alt={cls["클래스"]}
              />
              <CardContent sx={styles.cardContent}>
                <Typography variant="subtitle1" sx={styles.className}>
                  {cls["클래스"]}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
