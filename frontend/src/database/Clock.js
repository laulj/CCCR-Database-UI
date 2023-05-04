import * as React from 'react';
import { Box, Paper, Fade, Typography } from '@mui/material';

// Custom interval hook
function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    React.useEffect(() => {
        savedCallback.current = callback;
    });

    React.useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        let id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

export default function Clock() {
    const [time, setTime] = React.useState((new Date()).toLocaleString());

    useInterval(() => {
        setTime((new Date()).toLocaleString());
    }, 1000)


    return (
        <Box sx={{ height: 180 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: "right",
                alignItems: "center",
            }}>

                <Paper sx={{ m: 0 }} elevation={1}>
                    <Fade in={true} timeout={{
                        enter: 0,
                        exit: 0,
                    }}>
                        <Box component="div" sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 1,
                            width: 175,
                            height: 50,
                        }}>
                            <Typography variant="overline" display="block" gutterBottom>
                                {time}
                            </Typography>
                        </Box>
                    </Fade>
                </Paper>
            </Box>
        </Box >
    );
}