import * as React from 'react';
import {
    Grid, Box, Paper, Button, IconButton, Typography, Divider,
    TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem,
    Accordion, AccordionSummary, AccordionDetails, ToggleButton,
    Tooltip, Collapse
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { ClearSharp, FileUpload, ExpandMore, Check, } from '@mui/icons-material';

const ConfigInputs = ({
    error, setError,
    dirHandle, setDirHandle,
    imagePreview, setImagePreview,
    rowFetchLoadingState, setRowFetchLoadingState,
    rows, setRows,
    rowSelectionModel, setRowSelectionModel,
    settings, setSettings
}) => {
    var validation_status = {
        img_dir: {
            error: false,
            helpText: "",
        },
        output_dir: {
            error: false,
            helpText: "",
        },
        log_output: {
            error: false,
            helpText: "",
        },
        drop_score: {
            error: false,
            helpText: "",
        },
        det_db_thresh: {
            error: false,
            helpText: "",
        },
    }


    // Validate Settings
    if (settings.inputs.img_dir === settings.inputs.output_dir) {
        validation_status = {
            ...validation_status,
            img_dir: {
                error: true,
                helpText: "Input, Output, and Output logs directory must be different.",
            },
            output_dir: {
                error: true,
                helpText: "Input, Output, and Output logs directory must be different.",
            },
        }
    } else if (settings.inputs.img_dir === settings.inputs.log_output) {
        validation_status = {
            ...validation_status,
            img_dir: {
                error: true,
                helpText: "Input, Output, and Output logs directory must be different.",
            },
            log_output: {
                error: true,
                helpText: "Input, Output, and Output logs directory must be different.",
            },
        }
    }
    if (settings.inputs.drop_score < 0 || settings.inputs.drop_score > 1.0) {
        validation_status = {
            ...validation_status,
            drop_score: {
                error: true,
                helpText: "Value must be greater than 0 and less than 1.0",
            }
        }
    }
    if (settings.inputs.det_db_thresh < 0 || settings.inputs.det_db_thresh > 1.0) {
        validation_status = {
            ...validation_status,
            det_db_thresh: {
                error: true,
                helpText: "Value must be greater than 0 and less than 1.0",
            }
        }
    }
    console.log("validation:", validation_status);



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
                <Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>

                    {/* ---------- input_type ---------- */}
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

                    {/* ---------- image_side_limit ---------- */}
                    <Grid item xs={6}>
                        <TextField id="image_side_limit" label="Input side limit" type="number" value={settings.inputs.img_side_limit} onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, img_side_limit: e.target.value } })} size="small" />
                        <FormHelperText>The longest side of the image or video, usually width</FormHelperText>
                    </Grid>

                    {/* ---------- drop_score ---------- */}
                    <Grid item xs={6}>
                        <TextField
                            id="drop_score"
                            label="Confidence level"
                            type="number"
                            value={settings.inputs.drop_score}
                            onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, drop_score: e.target.value } })}
                            size="small"
                            error={validation_status.drop_score.error}
                            helperText={validation_status.drop_score.helpText}
                        />
                        <FormHelperText>The minimum confidence level of the OCR to consider a valid result</FormHelperText>
                    </Grid>

                    {/* ---------- image_dir ---------- */}
                    <Grid item xs={10}>
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
                                    error={validation_status.img_dir.error}
                                    helperText={validation_status.img_dir.helpText}
                                    fullWidth
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
                        <Collapse in={settings.inputs.type === "video"}>
                            <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                                <TextField
                                    id="image_dir"
                                    label="Input file"
                                    value={settings.inputs.image_dir}
                                    onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, image_dir: e.target.value } })}
                                    placeholder="Select a video file"
                                    size="small"
                                    variant="standard"
                                    fullWidth
                                />

                                {
                                    settings.inputs.image_dir === "" ? null :
                                        <>
                                            <Tooltip title="Remove current path">
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

                    {/* ---------- draw_img_save_dir ---------- */}
                    <Grid item xs={10} sx={{ mb: 4 }}>
                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                            <TextField
                                id="draw_img_save_dir"
                                label="Output dir."
                                value={settings.inputs.output_dir}
                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, output_dir: e.target.value } })}
                                placeholder="Select Output Directory"
                                size="small"
                                variant="standard"
                                error={validation_status.output_dir.error}
                                helperText={validation_status.output_dir.helpText}
                                fullWidth
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


                    <div >
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography variant="button" display="block" sx={{ width: '33%', flexShrink: 0, }}>
                                    Advanced
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Optional parameters</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
                                    {/* ---------- det_db_thresh ---------- */}
                                    <Grid item xs={5}>
                                        <TextField
                                            id="det_db_thresh"
                                            label="Det. confidence level"
                                            type="number"
                                            value={settings.inputs.det_db_thresh}
                                            onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, det_db_thresh: e.target.value } })}
                                            size="small"
                                            error={validation_status.det_db_thresh.error}
                                            helperText={validation_status.det_db_thresh.helpText}
                                        />
                                        <FormHelperText>The confidence level of the detection model of the OCR.</FormHelperText>
                                    </Grid>

                                    {/* ---------- show_log ---------- */}
                                    <Grid item xs={5}>
                                        <Grid item xs={12} sx={{ mt: 1, display: "flex", flexDirection: 'row', justifyContent: "flex-end", alignItems: "center" }}>
                                            <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13, mr: 2, mt: 1 }}>Debug Logs</Typography>
                                            <ToggleButton
                                                value="check"
                                                selected={settings.inputs.show_log}
                                                onChange={() => setSettings({ ...settings, inputs: { ...settings.inputs, show_log: !settings.inputs.show_log } })}
                                                size="small"
                                                color="success"
                                            >
                                                <Check />
                                            </ToggleButton>
                                        </Grid>
                                    </Grid>

                                    {/* ---------- save_log_path ---------- */}
                                    <Grid item xs={10} >
                                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                                            <TextField
                                                id="save_log_path"
                                                label="Output Log dir."
                                                value={settings.inputs.log_output}
                                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, log_output: e.target.value } })}
                                                placeholder="Select Output Log Directory"
                                                size="small"
                                                variant="standard"
                                                error={validation_status.log_output.error}
                                                helperText={validation_status.log_output.helpText}
                                                fullWidth
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

                                    {/* ---------- groundtruth path ---------- */}
                                    <Grid item xs={10}>
                                        <Grid item xs={12} sx={{ mt: 0, display: "flex", flexDirection: 'row', justifyContent: "flex-start", alignItems: "center" }}>
                                            <TextField
                                                id="ground_truth_path"
                                                label="Pred. Groundtruth file path"
                                                value={settings.inputs.ground_truth_path}
                                                onChange={(e) => setSettings({ ...settings, inputs: { ...settings.inputs, ground_truth_path: e.target.value } })}
                                                size="small"
                                                variant="standard"
                                                fullWidth
                                            />

                                            {
                                                settings.inputs.ground_truth_path === "" ? null :
                                                    <>
                                                        <Tooltip title="Remove current directory">
                                                            <IconButton color='warning' onClick={() => setSettings({ ...settings, inputs: { ...settings.inputs, ground_truth_path: "" } })} sx={{ mt: 1 }}>
                                                                <ClearSharp />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                            }
                                        </Grid>
                                        <FormHelperText>Full file path to where prediction ground truth is located. The Groundtruth format is located in Github. The analyzed result will be stored in the Output Log dir..</FormHelperText>
                                    </Grid>

                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </div>

                </Grid>
            </Box >
        </>
    )
}

export default ConfigInputs;