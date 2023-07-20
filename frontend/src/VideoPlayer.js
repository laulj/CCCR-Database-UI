import { ImageSearch } from '@mui/icons-material';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const VideoPlayer = () => {
    const socketRef = useRef(null);
    const socketRef2 = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        socketRef.current = io('http://localhost:7000');
        socketRef2.current = io('http://172.17.0.2:5005');

        socketRef.current.emit('request_frames');

        
        
        setTimeout(function() {
            socketRef2.current.emit('request_frames');
            socketRef2.current.on('frame', handleFrameReceived);
          }, 5000);
        
        
        // Clean up the WebSocket connection on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleFrameReceived = (data) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            setImageLoaded(true);
            setImageSrc(event.target.result);
        };

        reader.readAsDataURL(new Blob([data.image], { type: 'image/jpeg' }));
    };
    
    useEffect(() => {
        console.log("image:", imageSrc);
    }, [imageSrc])

    return (
        <div>
            {imageLoaded && <img src={imageSrc} alt="Stream" />}
        </div>
    );
};

export default VideoPlayer;
