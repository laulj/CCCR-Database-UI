import * as React from 'react';
import { Grid, Box, Paper, Button, IconButton, Typography, Divider, TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem, Tooltip, Collapse, Fade } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { ClearSharp, FileUpload } from '@mui/icons-material';
import TextArea from 'antd/es/input/TextArea';
import { styled } from '@mui/material/styles';
import HorizontalLinearStepper from './Stepper';
import Summary from './Summary';

export default function Settings({
    selectedMenuIndex,
    error, setError,
    dirHandle, setDirHandle,
    imagePreview, setImagePreview,
    rowFetchLoadingState, setRowFetchLoadingState,
    rows, setRows,
    rowSelectionModel, setRowSelectionModel,
    settings, setSettings
}) {

    React.useEffect(() => {
        console.log(settings)
    }, [settings])

    const [progress, setProgress] = React.useState('');
    const [run, setRun] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const startProcess = async () => {
        setLoading(true);
        const response = await fetch("/pull-image");
        const data = await response.text();
        console.log("data:", data);
        setProgress(data);
        setLoading(false);
        setRun(true);

        const interval = setInterval(startProcess, 1000); // Fetch progress every 1 second

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }
    const stopProcess = async () => {
        setRun(false);
        window.location.reload();
    }
    const Div = styled('div')((theme) => ({ ...theme.typography, display: settings.configured ? "none" : "block" }))
    return (
        <>

            {/*<Typography variant="h5" gutterBottom sx={{ mb: 5 }}>
                Configurations
            </Typography>*/}
            {!settings.configured ?
                <Fade in={true}>
                    <Box sx={{ mx: 5, mt: 2 }}>
                        <HorizontalLinearStepper
                            error={error} setError={setError}
                            dirHandle={dirHandle} setDirHandle={setDirHandle}
                            imagePreview={imagePreview} setImagePreview={setImagePreview}
                            rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                            rows={rows} setRows={setRows}
                            rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                            settings={settings} setSettings={setSettings}
                        />
                    </Box>
                </Fade>

                :

                <Fade in={true}>
                    <Box sx={{ mx: 5, mt: 2 }}>
                        <Summary
                            error={error} setError={setError}
                            dirHandle={dirHandle} setDirHandle={setDirHandle}
                            imagePreview={imagePreview} setImagePreview={setImagePreview}
                            rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                            rows={rows} setRows={setRows}
                            rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                            settings={settings} setSettings={setSettings}
                        />
                    </Box>
                </Fade>
            }
        </>
    )
}