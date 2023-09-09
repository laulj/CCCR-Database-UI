import * as React from 'react';
import { Backdrop, Button, Typography, CircularProgress } from '@mui/material';

export default function SimpleBackdrop({ openBackdrop, setOpenBackdrop }) {

    return (
        <div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
                onClick={() => setOpenBackdrop(false)}
            >
                <Typography variant="h6">Restarting the Docker container... </Typography><CircularProgress color="inherit" size={35} sx={{ ml: 2 }} />
            </Backdrop>
        </div>
    );
}