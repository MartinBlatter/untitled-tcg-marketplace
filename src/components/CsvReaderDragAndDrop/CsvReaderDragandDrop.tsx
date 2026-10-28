import { Box, Chip } from "@mui/material";
import { useState } from "react";
import { useCSVReader } from "react-papaparse";
import { CsvReaderStyles } from "./styles";
import { useTranslations } from "next-intl";

export default function CsvReaderDragAndDrop({ handleUpload }: { handleUpload: (results: any) => void }) {
    const { CSVReader } = useCSVReader();
    const [zoneHover, setZoneHover] = useState(false);
    const t = useTranslations();

    return (
        <CSVReader
            onUploadAccepted={(results: any) => {
                handleUpload(results);
                setZoneHover(false);
            }}
            onDragOver={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(true);
            }}
            onDragLeave={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(false);
            }}
        >
            {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }: any) => (
                <Box sx={{ mt: 2 }}>
                    <Box {...getRootProps()} style={Object.assign({}, CsvReaderStyles.zone, zoneHover && CsvReaderStyles.zoneHover)}>
                        {acceptedFile ? (
                            <>
                                <Chip
                                    label={
                                        <>
                                            {acceptedFile.name}
                                            <ProgressBar />
                                        </>
                                    }
                                    variant="outlined"
                                    color="primary"
                                    {...getRemoveFileProps()}
                                />
                            </>
                        ) : (
                            t("csvUploadArea")
                        )}
                    </Box>
                </Box>
            )}
        </CSVReader>
    );
}
