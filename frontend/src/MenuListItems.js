import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Storage, Terminal, Settings } from '@mui/icons-material';

export default function MenuListItems({ selectedMenuIndex, setSelectedMenuIndex }) {

    const handleListItemClick = (e, index) => {
        setSelectedMenuIndex(index);
    };

    return (
        <React.Fragment>
            <ListItemButton
                selected={selectedMenuIndex === 0}
                onClick={(e) => handleListItemClick(e, 0)}
            >
                <ListItemIcon>
                    <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
                selected={selectedMenuIndex === 1}
                onClick={(e) => handleListItemClick(e, 1)}
            >
                <ListItemIcon>
                    <Storage />
                </ListItemIcon>
                <ListItemText primary="Database" />
            </ListItemButton>
            {/* 
            <ListItemButton
                selected={selectedMenuIndex === 2}
                onClick={(e) => handleListItemClick(e, 2)}
            >
                <ListItemIcon>
                    <Terminal />
                </ListItemIcon>
                <ListItemText primary="Terminal" />
            </ListItemButton>*/}
            <ListItemButton
                selected={selectedMenuIndex === 2}
                onClick={(e) => handleListItemClick(e, 2)}
            >
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
            </ListItemButton>
        </React.Fragment>
    )
}
