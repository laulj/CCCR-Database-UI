import React, { useState } from 'react';
import socketIOClient from 'socket.io-client';
import { Grid, Divider } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

const ImagePullProgress = ({ settings, setSettings, checking, setChecking, handleVerifyButtonClick, setOpenImagePullDialog, imagePullProgress, setImagePullProgress, imagePulling, setImagePulling }) => {
    const socketRef = React.useRef();

    const handleButtonClick = () => {
        let data = {};
        let isFinished = false;
        setImagePullProgress([]);
        setImagePulling(true);

        setSettings({ ...settings, requirements: { ...settings.requirements, isImage: false }, });
        setChecking({ ...checking, isImage: true });

        socketRef.current = socketIOClient('http://localhost:7000');

        socketRef.current.on('progress', async (response) => {
            if ("data" in response) {
                data = await JSON.parse(response.data);
            }

            // Check if the pull progress is finished
            if ("status" in response) {
                console.log("response.status:", response.status);
                if (response.status === "Image pull completed") {
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
                handleVerifyButtonClick('isImage');
            }

        });

        socketRef.current.on('connect_error', () => {
            socketRef.current.close();
            setImagePulling(false);
        });

        socketRef.current.on('disconnect', () => {
            setImagePulling(false);
        });

        socketRef.current.emit('start_pull');

        // Close the Pull Image Dialog
        setOpenImagePullDialog(false);
    };

    React.useEffect(() => {
        //console.log("progress:", imagePullProgress);
    }, [imagePullProgress])

    const parseProgress = (prevProgress, data) => {
        /* Format the received stream from image pull */
        let nextProgress = structuredClone(prevProgress);
        let [progressIndex, isImageIdExists] = ['', false];

        if (prevProgress.length === 0) {
            nextProgress.push({ rawData: data, parsedData: `${data.status} ${data.id}` });

        } else {
            for (let i = 0; i < prevProgress.length; i++) {
                let entry = prevProgress[i];

                //console.log(String(entry.rawData.id), String(data.id), String(entry.rawData.id) === String(data.id));
                if (String(entry.rawData.id) === String(data.id)) {
                    isImageIdExists = true;
                    progressIndex = i;
                    break;
                } else {
                    isImageIdExists = false;
                }
            }

            if (isImageIdExists) {
                // Update existing image pull progress data
                if ("progress" in data) {
                    nextProgress[progressIndex] = { rawData: data, parsedData: `${data.id}: ${data.status} ${data.progress}` };

                } else {
                    nextProgress[progressIndex] = { rawData: data, parsedData: `${data.id}: ${data.status}` };
                }

            } else {
                // Append new image pull progress data
                if ("progress" in data) {
                    nextProgress.push({ rawData: data, parsedData: `${data.id}: ${data.status} ${data.progress}` });

                } else {
                    if ("id" in data) {
                        nextProgress.push({ rawData: data, parsedData: `${data.id}: ${data.status}` });
                    } else {
                        nextProgress.push({ rawData: data, parsedData: `${data.status}` });
                    }
                }
            }
        }

        console.log("prevProgress:", prevProgress, "current:", data, "nextProgress:", nextProgress);

        return nextProgress;
    };

    return (
        <>
            {!imagePulling && (
                <LoadingButton
                    //variant="contained"
                    //size="small"
                    loading={imagePulling}
                    onClick={handleButtonClick}
                    disabled={imagePulling}
                >Proceed
                </LoadingButton>
            )}

        </>
    );
};

export default ImagePullProgress;
