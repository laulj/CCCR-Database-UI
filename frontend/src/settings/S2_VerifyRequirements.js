import * as React from 'react';
import socketIOClient from 'socket.io-client';
import {
    Grid, Box, Paper, Button, IconButton,
    Typography, Divider,
    TextField,
    CircularProgress, Fab,
    Card, CardActions, CardContent,
    Fade,
} from '@mui/material';
import { Check, PriorityHigh } from '@mui/icons-material'
import { green, red } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import ImagePullDialog from './ImagePullDialog';

var reqMessages = {
    isDocker: {
        success: 'Passed!',
        failed: 'Docker initialization failed, have you created the virtual env with requirements.txt?',
    },
    isImage: {
        success: 'Passed!',
        failed: 'Image not found',
    },
    isNvidia: {
        success: 'Passed!',
        failed: 'Nvidia driver not found',
    },
    isCUDA: {
        success: 'Passed!',
        failed: 'Failed to import CUDA library',
    },
    isCam: {
        success: 'Passed!',
        failed: 'Camera is not detected at position 0',
    },
}

const VerifyRequirements = ({ settings, setSettings, imagePullProgress, setImagePullProgress, imagePulling, setImagePulling, }) => {
    var urls = {
        isDocker: "http://localhost:7000/docker_check",
        isImage: "http://localhost:7000/image_check",
        isNvidia: "http://localhost:7000/nvidia_check",
        isCUDA: "http://localhost:7000/cuda_check",
        isCam: `http://localhost:7000/cam_check?pos=${settings.cam_pos}`,
    }

    const socketRef = React.useRef();
    //const [message, setMessage] = React.useState('');
    const [checking, setChecking] = React.useState({
        isDocker: false,
        isImage: false,
        isNvidia: false,
        isCUDA: false,
        isCam: false,
    });
    const [openImagePullDialog, setOpenImagePullDialog] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const timer = React.useRef();

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);
    React.useEffect(() => {
        //console.log('checking:', checking)
    }, [checking]);
    const buttonSx = {
        ...({
            '&:hover': {
                bgcolor: green[700],
            },
        }),
    };

    /*const handleisCUDASocketIO = () => {
        let data = {};
        let isFinished = false;

        socketRef.current = socketIOClient('http://localhost:7000');

        socketRef.current.on('cuda_checkOutput', async (response) => {
            if ("data" in response) {
                data = await JSON.parse(response.data);
            }

            // Check if the pull progress is finished
            if ("status" in response) {
                console.log("response.status:", response.status);
                if (response.status === "Process completed") {
                    isFinished = true;
                }
            }

            console.log('isFinished:', isFinished);
            // If the pull progress is not finished yet
            if (!isFinished) {
                //console.log("socket'progress':", data);
                // Only when the previous state is referred in the setState function, will it be pointed to the correct value
                setImagePullProgress((prevProgress) => { return parseProgress(prevProgress, data) });
            } else {
                // verify the if the docker image exists
                handleButtonClick('isCUDA');
            }

        });

        socketRef.current.on('connect_error', () => {
            socketRef.current.close();
            setImagePulling(false);
        });

        socketRef.current.on('disconnect', () => {
            setImagePulling(false);
        });

        // Close the Pull Image Dialog
        setOpenImagePullDialog(false);
    }*/

    const handleButtonClick = async (criteria) => {
        console.log('checking', !checking[criteria] === true)
        if (!checking[criteria]) {
            //setSuccess(false);
            //setLoading(true);
            // Prevent multiple requests to server at once
            if (!(checking.isDocker || checking.isImage || checking.isCUDA || checking.isNvidia)) {
                setSettings({ ...settings, requirements: { ...settings.requirements, [criteria]: false }, });
                setChecking({ ...checking, [criteria]: true });

                let response, responseMessage;
                let error = false;

                try {
                    // Request for docker status
                    response = await fetch(urls[criteria], { method: "POST" });

                    responseMessage = await response.json();
                    console.log(`${urls[criteria]} { method: 'POST' }:`, responseMessage);
                }
                catch (err) {
                    console.log(err);
                    error = true;
                }

                timer.current = window.setTimeout(() => {
                    if (!error) {
                        if (response.status === 200 || response.status === 201) {
                            console.log('passed!');
                            setSettings({ ...settings, requirements: { ...settings.requirements, [criteria]: true }, message: { ...settings.message, [criteria]: reqMessages[criteria].success } });
                        } else {
                            console.log('failed!');
                            if (criteria === 'isCam') {
                                reqMessages[criteria].failed = responseMessage.message;
                            }

                            setSettings({ ...settings, requirements: { ...settings.requirements, [criteria]: false }, message: { ...settings.message, [criteria]: reqMessages[criteria].failed } });

                            // Open Image Pull Dialog if haven't before
                            if (criteria === 'isImage' && imagePullProgress.length === 0) {
                                setOpenImagePullDialog(true);
                            }
                        }
                    } else {
                        setSettings({ ...settings, requirements: { ...settings.requirements, [criteria]: false }, message: { ...settings.message, [criteria]: 'Server connection refused.' } });
                    }

                    setChecking({ ...checking, [criteria]: false });

                }, 1000);

                //console.log('before', 'settings:', settings, 'checking:', checking);
                //console.log('before', 'success:', success, 'loading:', loading);

                /*timer.current = window.setTimeout(() => {
                    setSuccess(true);
                    setLoading(false);
                    console.log('true', settings)
    
                    setSettings({ ...settings, requirements: { ...settings.requirements, [criteria]: true }, });
                    setChecking({ ...checking, [criteria]: false });
                }, 2000);*/
            }
        }
        //console.log('after', 'settings:', settings, 'checking:', checking);
        //console.log('after', 'success:', success, 'loading:', loading);
        /*return () => {
            clearTimeout(timer.current); // Cleanup the timer on component unmount
        };*/
    };



    return (
        <Fade in={true}>
            <Grid container rowSpacing={0} columnSpacing={{ xs: 0, sm: 0, md: 0 }}>

                <Grid item xs={12} style={{ paddingBottom: '0 !important' }}>
                    <Box sx={{ pl: 4, pr: 0 }}>
                        <Grid container sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Grid item xs={3}>
                                <Typography variant="h5" component="div" sx={{ fontSize: 14, letterSpacing: 1 }}>
                                    Requirement
                                </Typography>
                            </Grid>

                            <Grid item xs={5}>
                                <Typography variant="h5" component="div" sx={{ fontSize: 14, letterSpacing: 1 }}>
                                    Message
                                </Typography>
                            </Grid>

                            <Grid item xs={2}>
                                <Typography variant="h5" component="div" sx={{ fontSize: 14, letterSpacing: 1 }}>
                                    Status
                                </Typography>
                            </Grid>

                            <Grid item xs={2}>
                                <Typography variant="h5" component="div" sx={{ fontSize: 14, letterSpacing: 1 }}>
                                    Action
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Requirement key='docker' name={'Docker SDK'} criteria={'isDocker'}
                    settings={settings} setSettings={setSettings}
                    checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                    openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                    imagePulling={imagePulling} setImagePulling={setImagePulling} />

                <Box sx={{ pl: 5, m: 0, py: 0, color: 'grey' }}>|</Box>

                <Requirement key='image' name={'OCR Image'} criteria={'isImage'}
                    settings={settings} setSettings={setSettings}
                    checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                    openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                    imagePulling={imagePulling} setImagePulling={setImagePulling} />

                <Box sx={{ pl: 5, m: 0, py: 0, color: 'grey' }}>|</Box>

                {settings.processor === 'gpu' ?
                    <>
                        <Requirement key='nvidia' name={'Nvidia Driver'} criteria={'isNvidia'}
                            settings={settings} setSettings={setSettings}
                            checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                            openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                            imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                            imagePulling={imagePulling} setImagePulling={setImagePulling} />
                        <Box sx={{ pl: 5, m: 0, py: 0, color: 'grey' }}>|</Box>
                    </>
                    : null
                }

                <Requirement key='cuda' name={'CUDA'} criteria={'isCUDA'}
                    settings={settings} setSettings={setSettings}
                    checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                    openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                    imagePulling={imagePulling} setImagePulling={setImagePulling} />

                <Box sx={{ pl: 5, m: 0, py: 0, color: 'grey' }}>|</Box>

                <Requirement key='cam' name={'Camera (Optional)'} criteria={'isCam'}
                    settings={settings} setSettings={setSettings}
                    checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                    openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                    imagePulling={imagePulling} setImagePulling={setImagePulling} />
            </Grid>
        </Fade>
    )
}

const Requirement = ({ name, criteria, settings, setSettings,
    checking, setChecking, handleButtonClick,
    openImagePullDialog, setOpenImagePullDialog,
    imagePullProgress, setImagePullProgress,
    imagePulling, setImagePulling, }) => {
    const Div = styled('div')((theme) => ({ ...theme.typography, color: settings.requirements[criteria] ? green[500] : red[500] }))
    return (
        <Grid item xs={12} >
            <Card variant="outlined" sx={{ pl: 2, pr: 2, pt: 1, borderRadius: 5 }}>
                <Grid container sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Grid item xs={3}>
                        <CardContent >
                            <Typography variant="p" component="div" sx={{ fontSize: 14 }}>
                                {name}
                            </Typography>
                            {/* Camera position input field */
                                criteria === 'isCam' ?
                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 2, maxWidth: 100, }}>
                                            <TextField id="cam_index" label="cam. position" type="number" value={settings.cam_pos} onChange={(e) => setSettings({ ...settings, cam_pos: e.target.value })} size="small" />
                                        </Box>
                                    </Grid>
                                    : null
                            }
                        </CardContent>
                    </Grid>

                    <Grid item xs={5}>
                        <CardContent >
                            <Typography variant="body2" component="div" >
                                <Div>{settings.message[criteria]}</Div>
                            </Typography>
                        </CardContent>
                    </Grid>

                    <Grid item xs={2}>
                        <CardActions>
                            <Box sx={{ m: 1, mt: 0, position: 'relative' }}>
                                <Fab
                                    color={settings.requirements[criteria] ? "success" : (checking[criteria] ? "inherit" : "warning")}
                                    onClick={() => handleButtonClick(criteria)}
                                    size='medium'
                                    disabled={checking[criteria]}
                                >
                                    {settings.requirements[criteria] ? <Check /> : <PriorityHigh />}
                                </Fab>
                                {
                                    checking[criteria] && (
                                        <CircularProgress
                                            size={59}
                                            sx={{
                                                color: green[500],
                                                position: 'absolute',
                                                top: -5,
                                                left: -6,
                                                zIndex: 1,
                                            }}
                                        />
                                    )
                                }
                            </Box>
                        </CardActions>
                    </Grid>

                    <Grid item xs={2}>
                        <CardActions>
                            <Box sx={{ mb: 1, position: 'relative' }}>
                                <Button
                                    variant="outlined"
                                    color={settings.requirements[criteria] ? "success" : (checking[criteria] ? "inherit" : "warning")}
                                    disabled={checking[criteria]}
                                    onClick={() => handleButtonClick(criteria)}
                                >
                                    Verify
                                </Button>
                                {
                                    checking[criteria] && (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                color: green[500],
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                            }}
                                        />
                                    )
                                }
                            </Box>
                        </CardActions>
                    </Grid>

                    { /* Image dialog and image pulling progress */
                        criteria === 'isImage' ?
                            <Grid item xs={12}>
                                <ImagePullDialog
                                    settings={settings} setSettings={setSettings}
                                    checking={checking} setChecking={setChecking} handleButtonClick={handleButtonClick}
                                    openImagePullDialog={openImagePullDialog} setOpenImagePullDialog={setOpenImagePullDialog}
                                    imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                                    imagePulling={imagePulling} setImagePulling={setImagePulling}
                                />
                                {
                                    imagePullProgress.length !== 0 ? (
                                        <Box sx={{ pb: 2, px: 2 }}>
                                            <pre style={{ fontSize: 10, maxHeight: 250, backgroundColor: 'white', overflow: 'auto' }}>
                                                {imagePullProgress.map((entry, index) => (
                                                    <div key={'pullProgress' + index}>
                                                        {entry ? entry.parsedData : 'Error parsing progress.'}
                                                    </div>
                                                ))}

                                            </pre>
                                        </Box>
                                    )
                                        :
                                        null

                                }
                            </Grid>
                            :
                            null
                    }


                </Grid>
            </Card>
        </Grid>
    )
}

export default VerifyRequirements;