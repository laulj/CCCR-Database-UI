import React from 'react';
import { Grid, Divider, Paper, Box, Card, CardMedia, Button, Typography, Fade } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CameraIcon from '@mui/icons-material/Camera';
import Clock from './dashboard/Clock';

export default function Dashboard({ theme, error, setError, runOCR, setRunOCR, runOCRLoading, setRunOCRLoading, ocrLogs, setOCRLogs, settings, readConfigs, }) {
    React.useEffect(() => {
        if (!settings.configured) {
            setError({ type: "warning", msg: "Configuration is incomplete! Please configure the parameters through Settings." })
        } else if (!settings.status.container) {
            setError({ type: "warning", msg: "Container is offline." })
        } else if (!settings.status.server) {
            setError({ type: "warning", msg: "Server is offline." })
        }
    }, [])

    const startProcess = async () => {
        // Prevent Spamming
        if (!runOCRLoading) {
            setRunOCRLoading(true);
            let serverResponse;

            // Verify if the server is responding
            try {
                serverResponse = await fetch("http://172.17.0.2:5005/ping");
                console.log(serverResponse.status);

                if (serverResponse.status === 200) {
                    // Sleep for 0.5s
                    await new Promise(r => setTimeout(r, 500));

                    setRunOCR(true);

                    if (settings.inputs.type === "img") {
                        await fetch(`http://172.17.0.2:5005/${settings.inputs.type}`, {
                            method: "POST",
                            /*headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                'VIDEO_FILENAME': "inputs/CCCRVideoData1.mp4",
                            },
                            )*/
                        });
                        setRunOCR(false);
                        setError({ type: "info", msg: "Inference completed!" })
                    }

                } else {
                    setError({ type: "error", msg: "Server error: Failed to run the OCR." });
                }
            }
            catch (err) {
                await new Promise(r => setTimeout(r, 500));
                console.log("error:", err);
                setError({ type: "error", msg: "Configurations is incomplete!" });
            }

            setRunOCRLoading(false);
        }
    }

    const stopProcess = async () => {
        setRunOCR(false);
        window.location.reload();
        // Read config from the backend
        await readConfigs();
    }

    return (
        <>

            <Fade in={true}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ px: 0, display: 'flex', flexDirection: 'column' }}>
                            {
                                runOCR && settings.inputs.type !== "img" ?
                                    <Card variant="outlined" sx={{ minHeight: 500, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                                        <CardMedia
                                            component='img'
                                            title='video_cam_output'
                                            image={`http://172.17.0.2:5005/${settings.inputs.type}`}
                                        />
                                    </Card>
                                    :
                                    <Card variant="outlined" sx={{ height: 500, backgroundColor: 'rgb(0, 0, 0, 0.25)' }}>
                                        <Grid item xs={12} sx={{ m: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <CameraIcon sx={{ fontSize: 40, zIndex: 2 }} />
                                            <Clock />
                                        </Grid>
                                    </Card>
                            }
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ mx: 0, display: 'flex', flexDirection: 'column' }}>
                        {
                            runOCR ?
                                <Button variant="contained" size="small" color="error" onClick={stopProcess}>Stop</Button>
                                :
                                <LoadingButton variant="contained" size="small" loading={runOCRLoading} onClick={startProcess}>Run</LoadingButton>
                        }
                    </Grid>

                    <Grid item xs={12}>
                        <Paper
                            sx={{ pb: 2, px: 2, maxHeight: 550, }}
                        >
                            <Typography sx={{ pt: 2, my: 1, mx: 1 }}>Terminal Logs</Typography>
                            <Divider></Divider>
                            <Box
                                sx={{ fontSize: 10, height: 450, backgroundColor: 'white', display: 'flex', overflow: 'auto', flexDirection: 'column-reverse' }}
                            >
                                <pre >
                                    {ocrLogs.data.map((entry, index) => (
                                        <div key={'ocrLogs_' + index}>
                                            {entry}
                                        </div>
                                    ))}
                                </pre>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Fade>
        </>
    )
}