import * as React from 'react';
import { Grid, Box, Paper, Button, IconButton, Typography, Tooltip, Fade } from '@mui/material';
import { Image } from 'antd';
import DataGridDemo from './database/TableGrid';
import { InsertPhotoRounded, ClearSharp } from '@mui/icons-material';

export default function Database({
    error, setError,
    dirHandle, setDirHandle,
    imagePreview, setImagePreview,
    rowFetchLoadingState, setRowFetchLoadingState,
    rows, setRows,
    rowSelectionModel, setRowSelectionModel,
    settings, setSettings,
}) {

    const openDirectory = async () => {
        try {

            const myDirHandle = await window.showDirectoryPicker();

            setError({ ...error, msg: null });

            if (await getReadWritePermission(myDirHandle)) {
                clearCurrentDir();
                setRowFetchLoadingState(true);
                setDirHandle(myDirHandle);
                console.log("dirhandle", myDirHandle);

                await getDirFiles(myDirHandle);
                setRowFetchLoadingState(false);
            }
        }
        catch (err) {
            setRowFetchLoadingState(false);
            if (err.name !== "AbortError") {
                setError({ type: "error", msg: "Your browser does not support Filesystem API to read directory, are you using Chrome-based browser?" });
            }

            console.log('Request aborted:', err);
        }
    }
    const getReadWritePermission = async (handle) => {

        const permission = await handle.requestPermission({ mode: 'readwrite' });
        //console.log("permission:", permission)
        if (permission !== 'granted') {
            console.log("handle:", handle);
            setError({ type: "error", msg: `Permission denied to read and write to ${handle.name}.` });
            //throw new Error('No permission to open file');
        } else {
            setError({ ...error, msg: null })
            return true;
        }
    }

    const getDirFiles = async (dirHandle) => {
        if (dirHandle.kind !== "directory") {
            console.log("It is not a directory.")
            return
        }
        let count = 1;
        for await (const entry of dirHandle.values()) {
            console.log("entry: ", entry);
            if (entry.kind === "file") {
                var temp = entry.name.split('.').pop();
                var formats = ["jpg", "png", "gif"];
                if (formats.includes(temp)) {
                    const fileHandle = await dirHandle.getFileHandle(entry.name, {});
                    const file = await fileHandle.getFile();
                    const content = await getFileContents(file);
                    console.log("file: ", file);
                    // Retrieve and set image attributes
                    await processFileContents(count, 100, file, content);
                    count += 1;
                }

            } else if (entry.kind === "directory") {
                await getDirFiles(entry);
            }
        }
    }

    async function processFileContents(id, max, img, content) {
        let rawDatetime, prediction, confidence, inputFilename;
        const fileExtension = img.name.split('.')[1];
        let date;

        try {
            [rawDatetime, prediction, confidence, ...inputFilename] = img.name.split('.')[0].split('_');
            let time = rawDatetime.split('T')[1].replaceAll('-', ':');
            date = rawDatetime.split('T')[0] + 'T' + time;

            // Get the input file name ( appended at the end of the output filename with '_')
            inputFilename = inputFilename.join("_");
        } catch (err) {
            // If the image format is not [date]_[prediction]_[confidence]_[input file name].[file extension]
            [rawDatetime, prediction, confidence, inputFilename] = [img.lastModified, null, null, ""]
            rawDatetime = new Date(rawDatetime);
            rawDatetime = rawDatetime.toISOString();
            let time = rawDatetime.split('T')[1].replaceAll('-', ':');
            date = rawDatetime.split('T')[0] + 'T' + time;
        }
        console.log('rawdatetime:', rawDatetime)


        setRows(rows => [
            ...rows,
            {
                id: id,
                inputName: inputFilename.length !== 0 ? (inputFilename + '.' + fileExtension) : null,
                outputName: img.name,
                date: date,
                lastModifiedDate: img.lastModifiedDate,
                size: img.size,
                type: img.type,
                src: content,
                prediction: prediction,
                confidence: confidence,
            }
        ])
    }

    const getFileContents = async (file) => {
        switch (file.type) {
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/gif':
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.addEventListener('loadend', () => resolve(reader.result));
                    reader.readAsDataURL(file);
                });

            default:
                return file.text();
        }
    }

    const clearCurrentDir = () => {
        // Clear current directories and its related files
        setDirHandle(null);
        setImagePreview(null);
        setRowFetchLoadingState(false);
        setRows([]);
        setRowSelectionModel([]);
    }

    return (
        <>
            <Fade in={true}>
                <Grid container spacing={3}>
                    {/* Image Preview */}
                    <Grid item xs={12}>
                        <Button variant='contained' onClick={openDirectory}>Open Dir.</Button>
                        <Typography variant="caption" display="block" gutterBottom sx={{ mt: 1, fontSize: 14 }}>
                            Open and grant the website the permissions to read and write to your output directory and to view the inferenced images respectively.
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper
                            id="imagePreview"
                            sx={{
                                p: 1,
                                //minHeight: 350,
                                width: '100%',
                                backgroundColor: 'rgb(0, 0, 0, 0.005)',
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                            {
                                imagePreview !== null ?
                                    <Image
                                        //width={200}
                                        //height={200}
                                        src={imagePreview !== null ? imagePreview.src : "error"}
                                        placeholder={true}
                                        fallback="data:image/png;base64,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"
                                        alt="Data image preview"
                                        preview={{
                                            scaleStep: 0.5,
                                            src: imagePreview.src,
                                        }}
                                    />
                                    :
                                    <Grid item xs={12} sx={{ my: 5, display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                                        <InsertPhotoRounded sx={{ fontSize: 75, mb: 1 }} />
                                        <Typography variant="caption" display="block" gutterBottom>Select an image to preveiw</Typography>
                                    </Grid>
                            }
                        </Paper>
                    </Grid>

                    {/* Database Table */}
                    <Grid item xs={12}>
                        <DataGridDemo dirHandle={dirHandle} imagePreview={imagePreview} setImagePreview={setImagePreview} rowFetchLoadingState={rowFetchLoadingState} rows={rows} setRows={setRows} rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel} />
                    </Grid>

                </Grid >
            </Fade>
        </>
    )
}