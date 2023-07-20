import React from 'react';
import { Grid, Paper, Card, CardMedia, Button, Typography, Fade } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CameraIcon from '@mui/icons-material/Camera';
import Clock from './Clock';
import VideoPlayer from './VideoPlayer';
import io from 'socket.io-client';
//import ImageIcon from '@mui/icons-material/Image';

export default function Dashboard({ theme, settings }) {
    const socketRef = React.useRef(null);

    const [run, setRun] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const startProcess = async () => {
        setLoading(true);
        // Check if server is responding
        const serverResponse = await fetch("http://172.17.0.2:5005/ping");
        console.log(serverResponse.status);

        if (serverResponse.status === 200) {
            const videoResponse = await fetch("http://172.17.0.2:5005/video", {
                method: "POST",
                //mo</Fade>de: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    'VIDEO_FILENAME': "inputs/CCCRVideoData1.mp4",
                },
                )
            });
            // Sleep for 0.5s, waiting for the server to initialize
            await new Promise(r => setTimeout(r, 500));

            setRun(true);

        }
        setLoading(false);
    }
    const stopProcess = async () => {
        setRun(false);
        window.location.reload();
    }

    React.useEffect(() => {
        socketRef.current = io('http://localhost:7000');

        socketRef.current.emit('start_containerServer');

        // Clean up the WebSocket connection on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <Fade in={true}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ px: 0, display: 'flex', flexDirection: 'column' }}>
                        {
                            run ?
                                <Card variant="outlined" sx={{ minHeight: 500, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                                    <CardMedia
                                        component='img'
                                        title='video_cam_output'
                                        image={"http://172.17.0.2:5005/video"}
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
                        {/* run ?
                        <VideoPlayer />
                        :
                        <Card variant="outlined" sx={{ height: 500, backgroundColor: 'rgb(0, 0, 0, 0.25)' }}>
                            <Grid item xs={12} sx={{ m: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <CameraIcon  sx={{ fontSize: 40, zIndex: 2 }} />
                                <Clock />
                            </Grid>
                        </Card>
                    */}
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ mx: 0, display: 'flex', flexDirection: 'column' }}>
                    {
                        run ?
                            <Button variant="contained" size="small" color="error" onClick={stopProcess}>Stop</Button>
                            :
                            <LoadingButton variant="contained" size="small" loading={loading} onClick={startProcess}>Run</LoadingButton>
                    }
                </Grid>

            </Grid>
        </Fade>
    )
}