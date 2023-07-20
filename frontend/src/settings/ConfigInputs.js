import * as React from 'react';
import { Grid, Box, Paper, Button, IconButton, Typography, Divider, TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem, Tooltip, Collapse } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { ClearSharp, FileUpload } from '@mui/icons-material';

const ConfigInputs = ({
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
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { my: 1 },
                }}
                noValidate
                autoComplete="off"
            >
                <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
                    <Grid item xs={6}>
                        <FormControl sx={{ my: 1, minWidth: 80 }}>
                            <InputLabel id="input_type_label">Type</InputLabel>
                            <Select
                                labelId="input_type_label"
                                id="input_type"
                                value={settings.inputs.type}
                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, type: e.target.value } })}
                                label="Input Type"
                                size="small"
                            >
                                <MenuItem value="img">Image</MenuItem>
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="cam">Cam</MenuItem>
                            </Select>
                        </FormControl>
                        <FormHelperText>The input file type</FormHelperText>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField id="image_side_limit" label="Input side limit" type="number" value={settings.inputs.img_side_limit} onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, img_side_limit: e.target.value } })} size="small" />
                        <FormHelperText>The longest side of the image or video, usually width</FormHelperText>
                    </Grid>

                    <Grid item xs={6}>
                        <Collapse in={settings.inputs.type === "img"}>
                            <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                                <TextField
                                    id="image_dir"
                                    label="Input dir."
                                    value={settings.inputs.image_dir}
                                    onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, image_dir: e.target.value } })}
                                    placeholder="Select Image Directory"
                                    size="small"
                                    variant="standard"
                                //required
                                //sx={{ flex: 1 }}
                                />

                                {
                                    settings.inputs.image_dir === "" ? null :
                                        <>
                                            <Tooltip title="Remove current directory">
                                                <IconButton color='warning' onClick={() => setSettings({ ...settings, inputs: { ...settings.inputs, image_dir: "" } })} sx={{ mt: 1 }}>
                                                    <ClearSharp />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                }
                            </Grid>
                            <FormHelperText>Full folder path to where image(s) is located</FormHelperText>
                        </Collapse>
                        <Collapse in={!(settings.inputs.type === "img")}>
                            <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                                <TextField
                                    id="image_dir"
                                    label="Input dir."
                                    value={settings.inputs.image_dir}
                                    onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, image_dir: e.target.value } })}
                                    placeholder="Select Image Directory"
                                    size="small"
                                    variant="standard"
                                //required
                                //sx={{ flex: 1 }}
                                />

                                {
                                    settings.inputs.image_dir === "" ? null :
                                        <>
                                            <Tooltip title="Remove current directory">
                                                <IconButton color='warning' onClick={() => setSettings({ ...settings, inputs: { ...settings.inputs, image_dir: "" } })} sx={{ mt: 1 }}>
                                                    <ClearSharp />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                }
                            </Grid>
                            <FormHelperText>Full file path to the video file</FormHelperText>
                        </Collapse>
                    </Grid>

                    <Grid item xs={6} >
                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                            <TextField
                                id="draw_img_save_dir"
                                label="Output dir."
                                value={settings.inputs.output_dir}
                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, output_dir: e.target.value } })}
                                placeholder="Select Output Directory"
                                size="small"
                                variant="standard"
                            />

                            {
                                settings.inputs.output_dir === "" ? null :
                                    <>
                                        <Tooltip title="Remove current directory">
                                            <IconButton color='warning' onClick={() => setSettings({ ...settings, inputs: { ...settings.inputs, output_dir: "" } })} sx={{ mt: 1 }}>
                                                <ClearSharp />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                            }
                        </Grid>
                        <FormHelperText>Full folder path where processed results will be saved</FormHelperText>
                    </Grid>

                    <Grid item xs={6} >
                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                            <TextField
                                id="save_log_path"
                                label="Output Log dir. (Optional)"
                                value={settings.inputs.log_output}
                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, log_output: e.target.value } })}
                                placeholder="Select Output Log Directory"
                                size="small"
                                variant="standard"
                            />

                            {
                                settings.inputs.log_output === "" ? null :
                                    <>
                                        <Tooltip title="Remove current directory">
                                            <IconButton color='warning' onClick={() => setSettings({ ...settings, inputs: { ...settings.inputs, log_output: "" } })} sx={{ mt: 1 }}>
                                                <ClearSharp />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                            }
                        </Grid>
                        <FormHelperText>Full folder path where output log will be saved</FormHelperText>
                    </Grid>

                    {/*
                    <Grid item xs={6} >
                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                            <TextField
                                id="save_log_path"
                                label="Output Log Directory"
                                value={settings.inputs.log_output === null ? "" : settings.inputs.log_output}
                                placeholder="Select Output Log Directory"
                                //size="small"
                                variant="standard"
                                required
                            //sx={{ flex: 1 }}
                            />
                            <IconButton variant="outlined" onClick={openDirectory} sx={{ mt: 1 }}><FileUpload /></IconButton>
                            {
                                dirHandle === null ? null :
                                    <>
                                        <Divider sx={{ height: 30, m: 0.5, mt: 1 }} orientation="vertical" />

                                        <Tooltip title="Remove current directory">
                                            <IconButton color='warning' onClick={clearCurrentDir} sx={{ mt: 1 }}>
                                                <ClearSharp />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                            }
                        </Grid>
                        <FormHelperText>Full folder path where output log will be saved</FormHelperText>
                    </Grid>
                    */}

                </Grid>
            </Box >
        </>
    )
}

export default ConfigInputs;