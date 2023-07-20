import * as React from 'react';
import { Grid, Box, Paper, Button, IconButton, Typography, Divider, TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem, Tooltip, Collapse, Fade } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { ClearSharp, FileUpload } from '@mui/icons-material';
import TextArea from 'antd/es/input/TextArea';
import ConfigProcessor from './ConfigProcessor';
import ConfigInputs from './ConfigInputs';

const MainConfig = ({
    error, setError,
    dirHandle, setDirHandle,
    imagePreview, setImagePreview,
    rowFetchLoadingState, setRowFetchLoadingState,
    rows, setRows,
    rowSelectionModel, setRowSelectionModel,
    settings, setSettings
}) => {
    const openDirectory = async () => {
        try {

            const myDirHandle = await window.showDirectoryPicker();

            setError(null);

            if (await getReadWritePermission(myDirHandle)) {
                setRowFetchLoadingState(true);
                setDirHandle(myDirHandle);
                console.log("dirhandle", myDirHandle);
                setSettings({ ...settings, inputs: { ...settings.inputs, dir: myDirHandle.name } })

                await getDirFiles(myDirHandle);
                setRowFetchLoadingState(false);
            }
        }
        catch (err) {
            setRowFetchLoadingState(false);
            if (err.name !== "AbortError") {
                setError("Your browser does not support Filesystem API to read directory, are you using Chrome-based browser?");
            }

            console.log('Request aborted:', err.name);
        }
    }
    const getReadWritePermission = async (handle) => {

        const permission = await handle.requestPermission({ mode: 'readwrite' });
        //console.log("permission:", permission)
        if (permission !== 'granted') {
            console.log("handle:", handle);
            setError(`Permission denied to read and write to ${handle.name}.`);
            //throw new Error('No permission to open file');
        } else {
            setError(null)
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
                    //console.log("file: ", file);
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
        [rawDatetime, prediction, confidence, ...inputFilename] = img.name.split('.')[0].split('_');
        let time = rawDatetime.split('T')[1].replaceAll('-', ':');
        const date = rawDatetime.split('T')[0] + 'T' + time;

        // Get the input file name ( appended at the end of the output filename with '_')
        inputFilename = inputFilename.join("_");

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
            <Divider textAlign="left" sx={{ mb: 3 }}>Inputs</Divider>

            <ConfigProcessor settings={settings} setSettings={setSettings} />

            <ConfigInputs
                error={error} setError={setError}
                dirHandle={dirHandle} setDirHandle={setDirHandle}
                imagePreview={imagePreview} setImagePreview={setImagePreview}
                rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                rows={rows} setRows={setRows}
                rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                settings={settings} setSettings={setSettings}
            />
        </>
    )
}

export default MainConfig;