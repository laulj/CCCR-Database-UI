import * as React from 'react';
import {
    Grid, Box, Paper, Button, Typography, CircularProgress,
    TextField, FormHelperText,
} from '@mui/material';
import { green, red } from '@mui/material/colors';
import { useSpring, animated } from '@react-spring/web'
import { useInterval } from '../utils/helpfulScripts';

export default function Summary({ settings, setSettings }) {
    const [springState, toggle] = React.useState(false);
    const [checking, setChecking] = React.useState({
        isContainer: false,
        isServer: false,
    });

    const reqContainerStatus = async () => {
        // Prevent spamming
        if (!checking.isContainer) {
            setChecking(checking => ({ ...checking, isContainer: true }));
            let containerResponse = {};
            let error = false;

            try {
                // Check if server is responding
                containerResponse = await fetch("http://localhost:7000/container_status");

            }
            catch (err) {
                console.log(err);
                error = true;
            }

            // Sleep for 2.0s, waiting for the server to initialize
            await new Promise(r => setTimeout(r, 2000));

            if (!error) {
                if (containerResponse.status === 200) {
                    setSettings((settings) => ({ ...settings, status: { ...settings.status, container: true } }));
                } else {
                    setSettings((settings) => ({ ...settings, status: { ...settings.status, container: false } }));
                }
            } else {
                setSettings((settings) => ({ ...settings, status: { ...settings.status, container: false } }));
            }
            setChecking((checking) => ({ ...checking, isContainer: false }));
        }

    }
    const reqServerStatus = async () => {
        // Prevent spamming
        if (!checking.isServer) {
            setChecking((checking) => ({ ...checking, isServer: true }));
            let serverResponse = {};
            let error = false;

            try {
                // Check if server is responding
                serverResponse = await fetch("http://172.17.0.2:5005/ping");
            }
            catch (err) {
                console.log(err);
                error = true;
            }

            // Sleep for 1.0s, waiting for the server to initialize
            await new Promise(r => setTimeout(r, 1000));

            if (!error) {
                if (serverResponse.status === 200) {
                    setSettings((settings) => ({ ...settings, status: { ...settings.status, server: true } }));
                } else {
                    setSettings((settings) => ({ ...settings, status: { ...settings.status, server: false } }));
                }
            } else {
                setSettings((settings) => ({ ...settings, status: { ...settings.status, server: false } }));
            }
            setChecking((checking) => ({ ...checking, isServer: false }));
        }
    }
    const updateAll = async () => {
        console.log(
            "checking reqContainerStatus:", settings
        )
        await reqContainerStatus();
        console.log(
            "checking reqServerStatus:", settings
        )
        await reqServerStatus();
    }

    // ----------React-Spring----------
    const [props, api] = useSpring(() => ({
        from: { opacity: 1 },
        opacity: springState ? 1 : 0.35,

    }))
    const handleRefresh = () => {
        api.start({
            "from": {
                opacity: springState ? 1 : 0.35,
            },
            "to": {
                opacity: springState ? 0.35 : 1,
            },
            config: { mass: 5, tension: 2000, friction: 200, duration: 250 },
        })
        api.start({
            "from": {
                opacity: springState ? 1 : 0.35,
            },
            "to": {
                opacity: springState ? 0.35 : 1,
            },
            config: { mass: 5, tension: 2000, friction: 200, duration: 1000 },
        })
    }

    // Animation
    useInterval(() => {
        toggle(!springState);
        handleRefresh();
    }, 1250);

    return (
        <>
            <Paper elevation={2} sx={{ width: '100%', p: 3, mb: 3, borderRadius: 2 }}>

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

            <Paper elevation={2} sx={{ width: '100%', p: 3, borderRadius: 2 }}>

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" gutterBottom>Status</Typography>
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            id="summary_updateAll"
                            variant="contained"
                            disabled={checking.isContainer || checking.isServer}
                            onClick={updateAll}
                            sx={{ px: 2, mr: 0 }}
                        >
                            Update All
                        </Button>
                    </Box>
                </Box>

                <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 2 }} sx={{ alignItems: 'center', pr: 4 }}>
                    <Grid item xs={9}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 14 }}>Container</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="button" color={settings.status.container ? green[700] : red[700]} display="block" gutterBottom sx={{ fontSize: 13 }}>
                            <animated.div style={props}>{settings.status.container ? "Online" : ""} </animated.div>
                            {settings.status.container ? "" : "Offline"}
                        </Typography>
                    </Grid>
                    <Grid item xs={1} >
                        <Box sx={{ position: 'relative' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={checking.isContainer}
                                onClick={reqContainerStatus}
                                sx={{ mb: 1, fontSize: 13 }}
                            >
                                Update
                            </Button>
                            {
                                checking.isContainer && (
                                    <CircularProgress
                                        size={22}
                                        sx={{
                                            color: green[500],
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-15px',
                                            marginLeft: '-10px',
                                        }}
                                    />
                                )
                            }
                        </Box>
                    </Grid>

                    <Grid item xs={9} sx={{}}>
                        <Typography variant="button" display="block" gutterBottom sx={{ fontSize: 14 }}>Server</Typography>
                    </Grid>
                    <Grid item xs={2} sx={{}}>
                        <Typography variant="button" color={settings.status.server ? green[700] : red[700]} display="block" gutterBottom sx={{ fontSize: 13 }}>
                            <animated.div style={props}>{settings.status.server ? "Online" : ""}</animated.div>
                            {settings.status.server ? "" : "Offline"}
                        </Typography>
                    </Grid>
                    <Grid item xs={1} sx={{}}>
                        <Box sx={{ position: 'relative' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={checking.isServer}
                                onClick={reqServerStatus}
                                sx={{ mb: 1, fontSize: 13 }}
                            >
                                Update
                            </Button>
                            {
                                checking.isServer && (
                                    <CircularProgress
                                        size={22}
                                        sx={{
                                            color: green[500],
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-15px',
                                            marginLeft: '-10px',
                                        }}
                                    />
                                )
                            }
                        </Box>
                    </Grid>
                </Grid>

            </Paper >
        </>
    );
}