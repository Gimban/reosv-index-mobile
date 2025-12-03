import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import * as styles from "./SheetData.styles";

// 본인의 구글 시트 ID와 GID로 교체하세요.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "0"; // 예: "0"
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

export default function SheetData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
          throw new Error("데이터를 가져오는 데 실패했습니다.");
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true, // 첫 번째 행을 헤더로 사용
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
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
  }, []);

  if (loading) {
    return (
      <Box sx={styles.container}>
        <CircularProgress />
        <Typography>데이터를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Typography color="error">오류: {error}</Typography>
      </Box>
    );
  }

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Container sx={styles.container}>
      <Typography variant="h5">Google 시트 데이터</Typography>
      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table sx={styles.table} aria-label="sheet-data-table">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} sx={styles.tableHeaderCell}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={`${rowIndex}-${cellIndex}`}>
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}