import * as React from 'react';
import io from 'socket.io-client';
import { styled } from '@mui/material/styles';
import { CssBaseline, Drawer as MuiDrawer, Box, AppBar as MuiAppBar, Toolbar, List, Typography, Divider, IconButton, Container, Alert, Collapse } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuListItems from './MenuListItems';
import Dashboard from './Dashboard';
import Database from './Database';
import Settings from './settings/Settings';
import Copyright from './Copyright';

const drawerWidth = 200;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

//const mdTheme = createTheme();


export default function Layout({ theme }) {
    /* ----------Menu Drawer Hooks----------*/
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const [selectedMenuIndex, setSelectedMenuIndex] = React.useState(2);

    const [error, setError] = React.useState({
        type: "info",
        msg: null,
    });

    /* ----------Dashboard Hooks---------- */
    const socketRef = React.useRef();
    const [runOCR, setRunOCR] = React.useState(false);
    const [runOCRLoading, setRunOCRLoading] = React.useState(false);
    const [ocrLogs, setOCRLogs] = React.useState({
        running: false,
        data: [],
    });

    React.useEffect(() => {
        socketRef.current = io('http://localhost:7000');
        socketRef.current.on('server_logs', async (data) => {
            // Remove ANSI escape codes
            const sanitizedOutput = sanitizeOutput(data);

            // Toggle the 'Run' button back to unclicked once the video inference is completed
            if (sanitizedOutput === "Source ended") {
                setRunOCR(false);
                setError({ type: "success", msg: "Inference completed!" })
            }

            //console.log('sanitiazed:', sanitizedOutput)
            setOCRLogs((prevOutput) => ({ ...prevOutput, data: [...prevOutput.data, sanitizedOutput] }));
        })

        // Read configurations
        readConfigs()

        // Clean up the WebSocket connection on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const sanitizeOutput = (output) => {
        // Remove control characters from output
        const sanitizedOutput = output.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        return sanitizedOutput;
    };

    React.useEffect(() => {
        console.log("runOCR:", runOCR)
    }, [runOCR])

    /* ----------Database Hooks---------- */
    const [dirHandle, setDirHandle] = React.useState(null);
    const [imagePreview, setImagePreview] = React.useState(null);
    const [rowFetchLoadingState, setRowFetchLoadingState] = React.useState(false);
    const [rows, setRows] = React.useState([]);
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);


    /* ----------Settings Hook---------- */
    const [settings, setSettings] = React.useState({
        configured: false,
        processor: "gpu",
        gpu_mem: 500,
        cpu_threads: 10,
        cam_pos: 0,
        inputs: {
            type: "img",
            image_dir: "",
            output_dir: "",
            img_side_limit: 1280,
            drop_score: 0.5,
            det_db_thresh: 0.3,
            ground_truth_path: "",
            log_output: "",
            show_log: false,
        },
        requirements: {
            isDocker: false,
            isImage: false,
            isNvidia: false,
            isCUDA: false,
            isCam: false,
        },
        status: {
            container: false,
            server: false,
        },
        message: {
            isDocker: '',
            isImage: '',
            isNvidia: '',
            isCUDA: '',
            isCam: '',
        },
    });
    React.useEffect(() => {
        if (settings.configured && settings.status.container && settings.status.server) {
            setError({ ...error, msg: null });
        }
    }, [settings])
    /* ---------- Configuration handlers ----------*/
    function parseNestedObject(obj) {
        /* Formatting the nested configuration JSON */
        let res = {};
        function recurse(obj, current = null) {
            let nested_res = {};
            for (const key in obj) {
                let value = obj[key];
                //console.log(key, ":", value);
                if (value !== undefined) {

                    if (value && typeof value === 'object') {
                        let temp = { [key]: recurse(value, key) }
                        //console.log("nested return:", temp)
                        res = { ...res, ...temp }
                        //console.log("res:", res);
                    } else {
                        // Parse key's value accordingly
                        if (value === "false") {
                            value = false;
                        } else if (value === "true") {
                            value = true;
                        } else if (value === null || value === "null") {
                            value = "";
                        } else if (key === "gpu_mem" || key === "cpu_threads" || key === "cam_pos" || key === "img_side_limit") {
                            value = parseInt(value);
                        } else if (key === "drop_score" || key === "det_db_thresh") {
                            value = parseFloat(value);
                        }

                        // Base case
                        if (current === null) {
                            //console.log("assign", key, ":", value);
                            res = { ...res, [key]: value }
                            //console.log("res:", res);
                        } else {
                            //console.log("return", key, ":", value);
                            nested_res = { ...nested_res, [key]: value };
                        }
                    }
                }
            }
            return nested_res;
        }

        recurse(obj);

        return res;
    }
    const readConfigs = async () => {
        let response, data;
        try {
            response = await fetch('http://localhost:7000/read_env', { method: "POST", });
            data = await response.json();

            //console.log("'/read_env' data:", data);

            const parsedData = parseNestedObject(data);
            setSettings(parsedData);

        } catch (err) {
            console.log(err);
            // Error handling
            setError({ type: "warning", msg: "Failed to load previous Configurations. Possibly due to the Flask backend being offline." })
        }


    }

    /* ---------- PullImage Hooks ---------- */
    const [imagePulling, setImagePulling] = React.useState(false);
    const [imagePullProgress, setImagePullProgress] = React.useState([]);


    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline enableColorScheme={true} />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: '24px', // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            {selectedMenuIndex === 0 ? "Dashboard" : (selectedMenuIndex === 1 ? "Database" : "Settings")}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <MenuListItems selectedMenuIndex={selectedMenuIndex} setSelectedMenuIndex={setSelectedMenuIndex} />
                    </List>
                </Drawer>

                {/* Background Box */}
                <Box
                    component="main"
                    sx={{
                        backgroundColor: theme,
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}
                >
                    <Toolbar />

                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

                        <Collapse in={error.msg !== null}>
                            <Alert severity={error.type} onClose={() => setError({ ...error, msg: null })} sx={{ mb: 2 }}>{error.msg}</Alert>
                        </Collapse>


                        {selectedMenuIndex === 0 ?
                            <Dashboard theme={theme}
                                error={error} setError={setError}
                                runOCR={runOCR} setRunOCR={setRunOCR} runOCRLoading={runOCRLoading} setRunOCRLoading={setRunOCRLoading} ocrLogs={ocrLogs} setOCRLogs={setOCRLogs}
                                settings={settings} readConfigs={readConfigs}
                            />
                            : (selectedMenuIndex === 1 ?
                                <Database
                                    error={error} setError={setError}
                                    dirHandle={dirHandle} setDirHandle={setDirHandle}
                                    imagePreview={imagePreview} setImagePreview={setImagePreview}
                                    rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                                    rows={rows} setRows={setRows}
                                    rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                                    settings={settings} setSettings={setSettings}
                                />
                                :
                                <Settings
                                    selectedMenuIndex={selectedMenuIndex}
                                    error={error} setError={setError}
                                    ocrLogs={ocrLogs} setOCRLogs={setOCRLogs}
                                    dirHandle={dirHandle} setDirHandle={setDirHandle}
                                    imagePreview={imagePreview} setImagePreview={setImagePreview}
                                    rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                                    rows={rows} setRows={setRows}
                                    rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                                    settings={settings} setSettings={setSettings} readConfigs={readConfigs}
                                    imagePulling={imagePulling} setImagePulling={setImagePulling}
                                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                                />
                            )
                        }
                        <Copyright sx={{ pt: 4 }} />
                    </Container>
                </Box>
            </Box>
        </>
    );
}
