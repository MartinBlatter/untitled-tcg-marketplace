@echo off
echo Starting MTG Card Image Update Process
echo =====================================
echo.
echo Step 1: Generating image update report...
echo This may take a few minutes depending on database size.

:: Run the API endpoint to generate the CSV file with increased timeout and retry
:: Adding --max-time 0 to disable timeout and --retry 3 for retries
curl --max-time 0 --retry 3 -o images.csv "http://localhost:3000/api/magic/image-update-report?format=csv"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to generate CSV file. Check if your Next.js server is running.
    exit /b 1
)

echo.
echo Step 2: Processing images from Scryfall...
echo This may take several minutes. Please be patient...

:: Call the download-card-images endpoint with increased timeout and retry
:: Adding --max-time 0 to disable timeout and --retry 3 for retries
curl --max-time 0 --retry 3 -X GET "http://localhost:3000/api/magic/download-card-images"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Warning: The curl command failed but images may still be processing.
    echo The image download process runs in the background and may take a while.
    echo Check image-errors.json file for any issues after processing completes.
)

echo.
echo Image update process completed!
echo You can check image-errors.json for any detailed error information.
pause
