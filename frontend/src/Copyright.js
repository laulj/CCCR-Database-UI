import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © 2016-2023 '}
            <Link color="inherit" href="https://github.com/laulj/CCCR-Database-UI" style={{ textDecoration: "none" }}>
                Lok Jing Lau and PaddlePaddle Authors. All Rights Reserved.
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}