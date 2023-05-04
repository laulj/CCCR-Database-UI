import { Grid, Paper, Card, CardMedia } from '@mui/material';

import Chart from './Chart';
import Deposits from './Deposits';
import Orders from './Orders';
//import Clock from './Clock';
import video from '../videos/CCCRVideoData1.mp4'

export default function Dashboard({ theme }) {
    return (
        <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 240,
                    }}
                >

                    <Chart theme={theme} onClick />
                </Paper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 240,
                    }}
                >
                    <Deposits />
                </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Orders />
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>

                </Paper>
                <Card >
                    <CardMedia
                        component='video'
                        title='title'
                        //className={classes.media}
                        image='./videos/CCCRVideoData1.mp4'
                        autoPlay={true}
                        controls
                    />
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <video width="750" height="500" controls >
                        <source src={video} type="video/mp4" />
                    </video>
                </Paper>
            </Grid>
        </Grid>)
}