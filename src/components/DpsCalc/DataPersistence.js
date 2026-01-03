import React, { useRef } from "react";
import { Box, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const DataPersistence = ({ data, onImport }) => {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `dps_calc_data_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error("Export error:", error);
      alert("데이터 내보내기 중 오류가 발생했습니다.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        // 유효성 검사: null이 아닌 객체인지 확인 (배열 제외)
        if (
          importedData &&
          typeof importedData === "object" &&
          !Array.isArray(importedData)
        ) {
          if (onImport) {
            const processedData = { ...importedData };
            if (
              processedData.specialWeapons &&
              Array.isArray(processedData.specialWeapons)
            ) {
              const MAX_SPECIAL_WEAPONS = 20;
              if (
                processedData.specialWeapons.length > MAX_SPECIAL_WEAPONS
              ) {
                processedData.specialWeapons =
                  processedData.specialWeapons.slice(0, MAX_SPECIAL_WEAPONS);
              }
            }
            onImport(processedData);
            alert("데이터를 성공적으로 불러왔습니다.");
          }
        } else {
          throw new Error("유효하지 않은 데이터 형식입니다.");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert(
          "데이터를 불러오는 중 오류가 발생했습니다. 올바른 JSON 파일인지 확인해주세요."
        );
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // 초기화하여 같은 파일을 다시 선택 가능하게 함
  };

  return (
    <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "flex-end" }}>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        size="small"
      >
        내보내기
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileUploadIcon />}
        onClick={handleImportClick}
        size="small"
      >
        불러오기
      </Button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default DataPersistence;
