import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import ImagePullProgress from './Pullimage';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ImagePullDialog({ settings, setSettings, checking, setChecking, handleButtonClick, openImagePullDialog, setOpenImagePullDialog, imagePullProgress, setImagePullProgress, imagePulling, setImagePulling, }) {

    return (
        <div>
            {/*<Button variant="outlined" onClick={() => setOpenImagePullDialog(true)}>
                Slide in alert dialog
            </Button>*/}
            <Dialog
                open={openImagePullDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setOpenImagePullDialog(false)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>Pull the image from Docker Hub</DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Docker Image 'laulj/ccc_ocr-tensorflow-cuda11.2:1.3.0' is not found on your system, would you like to proceed to pull it from Docker Hub?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button color="error" onClick={() => setOpenImagePullDialog(false)}>Cancel</Button>
                    {/*<Button onClick={() => setOpenImagePullDialog(false)}>Proceed</Button>*/}
                    <ImagePullProgress
                        settings={settings} setSettings={setSettings}
                        checking={checking} setChecking={setChecking} handleVerifyButtonClick={handleButtonClick}
                        setOpenImagePullDialog={setOpenImagePullDialog} imagePullProgress={imagePullProgress}
                        setImagePullProgress={setImagePullProgress}
                        imagePulling={imagePulling} setImagePulling={setImagePulling}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
}