import * as React from 'react';
import { Grid, Box, TextField, InputLabel, Select, FormControl, FormHelperText, MenuItem, Collapse, } from '@mui/material';

const ConfigProcessor = ({ settings, setSettings }) => {

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { my: 1 },
            }}
            noValidate
            autoComplete="off"
        >
            <Grid container rowSpacing={2} columnSpacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>

                <Grid item xs={6}>
                    <FormControl sx={{ my: 1, minWidth: 80 }}>
                        <InputLabel id="processor_label">Processor</InputLabel>
                        <Select
                            labelId="processor_label"
                            id="processor"
                            value={settings.processor}
                            onChange={(e) => setSettings({ ...settings, processor: e.target.value })}
                            label="processor"
                            size="small"
                        >
                            <MenuItem value="gpu">GPU</MenuItem>
                            <MenuItem value="cpu">CPU</MenuItem>
                        </Select>
                    </FormControl>
                    <FormHelperText>GPU is enabled by default</FormHelperText>
                </Grid>
                <Grid item xs={6}>
                    <Collapse in={settings.processor === "gpu"}>
                        <Grid item xs={12}>
                            <TextField id="gpu_mem" label="GPU mem. limit (MB)" type="number" value={settings.gpu_mem} onChange={(e) => setSettings({ ...settings, gpu_mem: e.target.value })} size="small" />
                            <FormHelperText>GPU memory allowance</FormHelperText>
                        </Grid>
                    </Collapse>
                    <Collapse in={settings.processor === "cpu"}>
                        <TextField id="cpu_threads" label="No. CPU threads" type="number" value={settings.cpu_threads} onChange={(e) => setSettings({ ...settings, cpu_threads: e.target.value })} size="small" />
                        <FormHelperText>No. CPU Threads allowance</FormHelperText>
                    </Collapse>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ConfigProcessor;