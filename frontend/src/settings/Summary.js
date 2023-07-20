import * as React from 'react';
import {
    Grid, Box, Paper, Button, IconButton, Typography, Divider, Accordion, AccordionDetails, AccordionSummary,
    TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem, Tooltip, Collapse, Fade
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfigProcessor from './ConfigProcessor';
import ConfigInputs from './ConfigInputs';

export default function Summary({
    error, setError,
    dirHandle, setDirHandle,
    imagePreview, setImagePreview,
    rowFetchLoadingState, setRowFetchLoadingState,
    rows, setRows,
    rowSelectionModel, setRowSelectionModel,
    settings, setSettings
}) {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <>
            <Paper elevation={2} sx={{ width: '100%', p: 3, borderRadius: 2 }}>

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" gutterBottom>Configurations</Typography>
                    <Button variant='contained' onClick={() => setSettings({ ...settings, configured: false })}>Edit</Button>
                </Box>

                <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Processor</Typography>
                        <TextField id="summary_processor" value={settings.processor} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>GPU is enabled by default</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Memory</Typography>
                        <TextField id="summary_processor_memory" type="number" value={settings.processor === 'gpu' ? settings.gpu_mem : settings.cpu_threads} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>{settings.processor === 'gpu' ? "GPU memory allowance" : "No. CPU Threads allowance"}</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Type</Typography>
                        <TextField id="summary_input_type" value={settings.inputs.type} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>The input file type</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Input side limit</Typography>
                        <TextField id="summary_image_side_limit" type="number" value={settings.inputs.img_side_limit} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>The longest side of the image or video, usually width</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Input dir.</Typography>
                        <TextField id="summary_image_dir" value={settings.inputs.image_dir} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>{settings.inputs.type === "img" ? "Full folder path to where image(s) is located" : "Full file path to the video file"}</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Output dir.</Typography>
                        <TextField id="summary_draw_img_save_dir" value={settings.inputs.output_dir} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>Full folder path where processed results will be saved</FormHelperText>
                    </Grid>

                    <Grid item xs={6} sx={{ mb: 2 }}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 13 }}>Output Log dir. (Optional)</Typography>
                        <TextField id="summary_save_log_path" value={settings.inputs.log_output} variant="outlined" size="small" disabled />
                        <FormHelperText sx={{ mt: 1 }}>Full folder path where output log will be saved</FormHelperText>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}