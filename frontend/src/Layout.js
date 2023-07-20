import * as React from 'react';
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
    // Menu Drawer Hooks
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const [selectedMenuIndex, setSelectedMenuIndex] = React.useState(2);

    // Menu: Database Hooks
    const [error, setError] = React.useState(null);
    //const [alertOpen, setAlertOpen] = React.useState(false);
    const [dirHandle, setDirHandle] = React.useState(null);
    const [imagePreview, setImagePreview] = React.useState(null);
    const [rowFetchLoadingState, setRowFetchLoadingState] = React.useState(false);
    const [rows, setRows] = React.useState([]);
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);

    // Menu: Settings Hook
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
            //save: false,
            img_side_limit: 1280,
            log_output: "",
        },
        requirements: {
            isDocker: false,
            isImage: false,
            isNvidia: false,
            isCUDA: false,
            isCam: false,
        },
        message: {
            isDocker: '',
            isImage: '',
            isNvidia: '',
            isCUDA: '',
            isCam: '',
        },
    });

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

                        <Collapse in={error !== null}>
                            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>
                        </Collapse>


                        {selectedMenuIndex === 0 ?
                            <Dashboard theme={theme} settings={settings} />
                            : (selectedMenuIndex === 1 ?
                                <Database
                                    error={error} setError={setError}
                                    dirHandle={dirHandle} setDirHandle={setDirHandle}
                                    imagePreview={imagePreview} setImagePreview={setImagePreview}
                                    rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                                    rows={rows} setRows={setRows}
                                    rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                                />
                                :
                                <Settings
                                    selectedMenuIndex={selectedMenuIndex}
                                    error={error} setError={setError}
                                    dirHandle={dirHandle} setDirHandle={setDirHandle}
                                    imagePreview={imagePreview} setImagePreview={setImagePreview}
                                    rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                                    rows={rows} setRows={setRows}
                                    rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                                    settings={settings} setSettings={setSettings}
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
