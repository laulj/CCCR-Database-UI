import * as React from 'react';
import { Button, Box, Tooltip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteOutlineTwoToneIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarDensitySelector,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';


const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .ant-empty-img-1': {
        fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
    },
    '& .ant-empty-img-2': {
        fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
    },
    '& .ant-empty-img-3': {
        fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
    },
    '& .ant-empty-img-4': {
        fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
    },
    '& .ant-empty-img-5': {
        fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
        fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
    },
}));

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay sx={{ mt: 2 }}>
            <svg
                width="120"
                height="100"
                viewBox="0 0 184 152"
                aria-hidden
                focusable="false"
            >
                <g fill="none" fillRule="evenodd">
                    <g transform="translate(24 31.67)">
                        <ellipse
                            className="ant-empty-img-5"
                            cx="67.797"
                            cy="106.89"
                            rx="67.797"
                            ry="12.668"
                        />
                        <path
                            className="ant-empty-img-1"
                            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                        />
                        <path
                            className="ant-empty-img-2"
                            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                        />
                        <path
                            className="ant-empty-img-3"
                            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                        />
                    </g>
                    <path
                        className="ant-empty-img-3"
                        d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                    />
                    <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                        <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                        <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                    </g>
                </g>
            </svg>
            <Box sx={{ mt: 1 }}>No Rows</Box>
        </StyledGridOverlay>
    );
}

const columns = [
    {
        field: 'id',
        headerName: 'ID',
        width: 75
    },
    {
        field: 'date',
        headerName: 'Date',
        width: 200,
        renderCell: (params) => (
            params ? params.row.lastModifiedDate.toLocaleString() : null
        ),
    },
    {
        field: 'prediction',
        headerName: 'Prediction',
        description: 'This column is not sortable.',
        width: 200,
        editable: false,
        sortable: false,
    },
    {
        field: 'confidence',
        headerName: 'Confidence',
        width: 100,
        renderCell: (params) => (
            params ? params.value : "NOT DETECTED"
        ),
        editable: false,
    },
    /*{
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (params) =>
            `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },*/
];

/*const rows1 = [
    { id: 1, date: new Date(1979, 0, 1), lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, date: new Date(1979, 0, 1), lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, date: new Date(1979, 0, 1), lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, date: new Date(1979, 0, 1), lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, date: new Date(1979, 0, 1), lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, date: new Date(1979, 0, 1), lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, date: new Date(1979, 0, 1), lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, date: new Date(1979, 0, 1), lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, date: new Date(1979, 0, 1), lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];*/

const rows1 = [
    { id: 1, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 2, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 3, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 4, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 5, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 6, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 7, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 8, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
    { id: 9, date: new Date(1979, 0, 1), prediction: 'ISO120DJS210', confidence: '82%' },
];

export default function DataGridDemo({ dirHandle, preview, setPreview, rowFetchLoadingState, rows, setRows, rowSelectionModel, setRowSelectionModel }) {
    const [openDialog, setOpenDialog] = React.useState(false);

    const customToolbar = () => {
        return (
            <GridToolbarContainer sx={{ pl: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box >
                    <GridToolbarDensitySelector sx={{ pr: 2, py: 2 }} />
                    <GridToolbarExport sx={{ pr: 2 }} />

                    {rowSelectionModel.length !== 0 ? (
                        <>
                            <Tooltip title="Delete">
                                <IconButton onClick={() => setOpenDialog(true)} >
                                    <DeleteOutlineTwoToneIcon color="info" fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Dialog
                                open={openDialog}
                                onClose={() => setOpenDialog(false)}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">
                                    {(() => {
                                        return (
                                            rowSelectionModel.length > 1 ? "Delete Entries" : "Delete Entry"
                                        )
                                    })()

                                    }
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        {(() => {
                                            let body = "Are you sure to delete";
                                            rowSelectionModel.map((rowId, index) => {
                                                body += ` data ${rowId}`;
                                                if (parseInt(index) !== parseInt(rowSelectionModel.length - 1)) {
                                                    body += ',';
                                                } else {
                                                    body += '?';
                                                }
                                            })
                                            return (
                                                body
                                            )
                                        })()}
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button color="error" onClick={removeItem} autoFocus>
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    ) : null
                    }
                </Box>
                <GridToolbarQuickFilter />
            </GridToolbarContainer>
        );
    }

    const removeItem = async () => {
        console.log('delete:', rowSelectionModel);
        let prevRows = [...rows];
        let filteredRows = [];
        rowSelectionModel.forEach((rowId) => {
            prevRows.map(async (row) => {
                if (row.id === rowId) {
                    await dirHandle.removeEntry(row.name);
                } else {
                    filteredRows.push(row)
                }
            })
            console.log("filteredRows:", filteredRows)
            //filteredRows = filteredRows.filter(row => row.id !== rowId)
        })
        //console.log('filter:', filteredRows);
        setRows(filteredRows);
        setOpenDialog(false);
    }

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={rowFetchLoadingState}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={[5, 10, 25]}
                density="compact"
                //autoHeight={true}
                sx={{
                    background: 'white'
                }}
                slots={{
                    toolbar: customToolbar,
                    noRowsOverlay: CustomNoRowsOverlay,
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 }, // time before applying the new quick filter value
                    },
                }}
                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);

                    //console.log("set", newRowSelectionModel, rows)
                    //setPreview(rows[newRowSelectionModel])
                    if (newRowSelectionModel.length !== 0) {
                        rows.forEach((row) => {
                            if (row.id === newRowSelectionModel[newRowSelectionModel.length - 1]) {
                                setPreview(rows[row.id - 1])
                                //console.log("setPreview to:", rows[row.id - 1])
                            }
                        })
                    } else {
                        setPreview(null);
                    }

                }}
                rowSelectionModel={rowSelectionModel}
                disableColumnSelector
                disableColumnFilter
                disableColumnMenu
            />
        </Box>
    );
}