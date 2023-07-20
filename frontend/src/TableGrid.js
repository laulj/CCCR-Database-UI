import * as React from 'react';
import { Button, IconButton, Box, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteOutlineTwoToneIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarDensitySelector,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {CustomNoRowsOverlay} from './Utils'

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
            params ? new Date(params.row.date).toLocaleString() : "N/A"
        ),
    },
    {
        field: 'prediction',
        headerName: 'Prediction',
        description: 'This column is not sortable.',
        width: 160,
        editable: false,
        sortable: false,
    },
    {
        field: 'confidence',
        headerName: 'Confidence',
        width: 110,
        renderCell: (params) => (
            params ? (parseFloat(params.row.confidence)/100).toFixed(2) : "N/A"
        ),
        editable: false,
    },
    {
        field: 'outputName',
        headerName: 'Output filename',
        width: 650,
        editable: false,
    },
    {
        field: 'inputName',
        headerName: 'Input filename',
        width: 350,
        editable: false,
    },
];

export default function DataGridDemo({ dirHandle, imagePreview, setImagePreview, rowFetchLoadingState, rows, setRows, rowSelectionModel, setRowSelectionModel }) {
    const [openDialog, setOpenDialog] = React.useState(false);

    const customToolbar = () => {
        return (
            <GridToolbarContainer sx={{ pl: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box >
                    <GridToolbarDensitySelector sx={{ pr: 2, py: 2 }} />
                    
                    <GridToolbarExport sx={{ pr: 2 }} />

                    { /* If one of the data is selected, display the Delete button */
                        rowSelectionModel.length !== 0 ? (
                            <>
                                <Tooltip title="Delete">
                                    <IconButton onClick={() => setOpenDialog(true)} >
                                        <DeleteOutlineTwoToneIcon color="info" fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                
                                {/* Modal dialog: "Are you sure to delete data ?" */}
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
        //console.log('delete:', rowSelectionModel);
        let prevRows = [...rows];
        let filteredRows = [];

        rowSelectionModel.forEach((rowId) => {
            prevRows.map(async (row) => {
                if (row.id === rowId) {
                    // Remove file from the directory
                    await dirHandle.removeEntry(row.name);
                } else {
                    filteredRows.push(row)
                }
            })
            console.log("filteredRows:", filteredRows)
            //filteredRows = filteredRows.filter(row => row.id !== rowId)
        })
        //console.log('filter:', filteredRows);
        
        // Update the data
        setRows(filteredRows);

        // Close the model dialog
        setOpenDialog(false);
    }

    const MyCustomNoRowsOverlay = () => <CustomNoRowsOverlay info={"No Rows"} />

    return (
        <Box sx={{ width: '100%' }}>
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
                autoHeight={true}
                sx={{
                    background: 'white'
                }}
                slots={{
                    toolbar: customToolbar,
                    noRowsOverlay: MyCustomNoRowsOverlay,
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 250 }, // time before applying the new quick filter value
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
                                setImagePreview(rows[row.id - 1])
                                //console.log("setImagePreview to:", rows[row.id - 1])
                            }
                        })
                    } else {
                        setImagePreview(null);
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