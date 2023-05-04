import * as React from 'react';
import { Grid, Box, Paper, Button } from '@mui/material';

//import Orders from './Orders';
//import EnhancedTable from './Table';
import DataGridDemo from './TableGrid';

export default function Database() {
    const [dirHandle, setDirHandle] = React.useState(null);
    const [preview, setPreview] = React.useState(null);
    const [rowFetchLoadingState, setRowFetchLoadingState] = React.useState(false);
    const [rows, setRows] = React.useState([]);
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
    React.useEffect(() => {
        //console.log("preview:", preview);
    }, [preview])
    React.useEffect(() => {
        console.log("dataset:", rows);
    }, [rows])
    React.useEffect(() => {
        //console.log("rowSelectionModel:", rowSelectionModel);
    }, [rowSelectionModel])
    const openDirectory = async () => {
        try {

            const dirHandle = await window.showDirectoryPicker();

            if (await getReadWritePermission(dirHandle)) {
                setRowFetchLoadingState(true);
                setDirHandle(dirHandle);
            }

            await getDirFiles(dirHandle);
            setRowFetchLoadingState(false);
        }
        catch (err) {
            setRowFetchLoadingState(false);
            console.log('Request aborted');
        }
    }
    const getReadWritePermission = async (handle) => {

        const permission = await handle.requestPermission({ mode: 'readwrite' });
        console.log("permission:", permission)
        if (permission !== 'granted') {
            throw new Error('No permission to open file');
        }


        return true;
    }

    const getDirFiles = async (dirHandle) => {
        if (dirHandle.kind !== "directory") {
            console.log("It is not a directory.")
            return
        }
        let count = 1;
        for await (const entry of dirHandle.values()) {
            //console.log("entry: ", entry);
            if (entry.kind === "file") {
                var temp = entry.name.split('.').pop();
                var formats = ["jpg", "png", "gif"];
                if (formats.includes(temp)) {
                    const fileHandle = await dirHandle.getFileHandle(entry.name, {});
                    const file = await fileHandle.getFile();
                    const content = await getFileContents(file);
                    //console.log("file: ", file);
                    const yo = await resize(count, 100, file, content);
                    count += 1;
                }

            } else if (entry.kind === "directory") {
                await getDirFiles(entry);
            }
        }
    }

    async function resize(id, max, img, content) {
        /*var reader = new FileReader();
        let data;
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                if (img.width > max) {
                    var oc = document.createElement('canvas'),
                        octx = oc.getContext('2d');
                    oc.width = img.width;
                    oc.height = img.height;
                    octx.drawImage(img, 0, 0);
                    if (img.width > img.height) {
                        oc.height = (img.height / img.width) * max;
                        oc.width = max;
                    } else {
                        oc.width = (img.width / img.height) * max;
                        oc.height = max;
                    }
                    octx.drawImage(oc, 0, 0, oc.width, oc.height);
                    octx.drawImage(img, 0, 0, oc.width, oc.height);
                    data = oc.toDataURL();
                } else {
                    data = oc.toDataURL();
                }
                //console.log('data:', data)
            };
            img.src = event.target.result;
        };*/
        setRows(rows => [
            ...rows,
            {
                //id: id,
                name: img.name,
                lastModifiedDate: img.lastModifiedDate,
                size: img.size,
                type: img.type,
                src: content,
                prediction: img.name,
                confidence: '65%',
            }
        ])
    }

    const getFileContents = async (file) => {
        switch (file.type) {
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/gif':
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.addEventListener('loadend', () => resolve(reader.result));
                    reader.readAsDataURL(file);
                });

            default:
                return file.text();
        }
    }

    return (
        <>
            {/* Recent Images */}
            <Grid container spacing={3}>
                {/*<Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Orders />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <EnhancedTable />
                </Grid>*/}
                <Grid item xs={12}>
                    <Button variant="contained" size="small" onClick={openDirectory}>Select Dir</Button>
                </Grid>
                <Grid item xs={12}>
                    <Paper
                        id="imagePreview"
                        sx={{
                            p: 1,
                            height: 300, width: '100%', display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                        <img src={preview !== null ? preview.src : null} style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }} />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <DataGridDemo dirHandle={dirHandle} preview={preview} setPreview={setPreview} rowFetchLoadingState={rowFetchLoadingState} rows={rows} setRows={setRows} rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel} />
                </Grid>
            </Grid >
        </>
    )
}