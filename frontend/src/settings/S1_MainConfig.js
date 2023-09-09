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


    return (
        <>
            <Divider textAlign="left" sx={{ mb: 3 }}>Inputs</Divider>

            <ConfigProcessor settings={settings} setSettings={setSettings} />

            <ConfigInputs
                settings={settings} setSettings={setSettings}
            />
        </>
    )
}

export default MainConfig;