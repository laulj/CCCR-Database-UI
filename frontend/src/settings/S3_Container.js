import * as React from 'react';
import { Grid, Box, Paper, Button, IconButton, Typography, Divider, TextField, InputBase, InputLabel, Select, FormControl, FormHelperText, MenuItem, Tooltip, Collapse, Fade } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { CheckCircle, ReportProblem } from '@mui/icons-material';

const RunContainer = ({ run, msg }) => {

    return (
        <Fade in={true}>
            <Paper variant='outlined' sx={{ borderRadius: 5 }}>
                <Box sx={{ height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {
                        run ?
                            <>
                                <CheckCircle color='success' sx={{ fontSize: 105, mb: 3 }} />

                                <Typography variant="body2" align='center' sx={{ maxWidth: '40vw', lineHeight: 1.5 }}>{msg}</Typography>
                            </>
                            :
                            <>
                                <ReportProblem color='warning' sx={{ fontSize: 105, mb: 3 }} />

                                <Typography variant="body2" align='center' sx={{ maxWidth: '40vw', lineHeight: 1.5 }}>{msg}</Typography>
                            </>
                    }
                </Box>
            </Paper>
        </Fade>
    )
}

export default RunContainer;