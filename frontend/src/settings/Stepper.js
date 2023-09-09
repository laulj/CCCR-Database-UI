import io from 'socket.io-client';
import * as React from 'react';
import {
  Grid, Box, Paper, Divider, Button, Typography, CircularProgress,
  Snackbar, Alert,
  Stepper, Step, StepLabel,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import { Check, PriorityHigh } from '@mui/icons-material'
import { green, red } from '@mui/material/colors';
import MainConfig from './S1_MainConfig';
import VerifyRequirements from './S2_VerifyRequirements';
import RunContainer from './S3_Container';
import SimpleBackdrop from './MyBackdrop';


const steps = [
  {
    label: 'OCR Configurations',
    description:
      <>
        <div>
          Before initiating the OCR, the inputs below control and affect the performance of the OCR.
          You may configure it optimally with respect to your machine. The configuration below is optimized for the following workstation:
        </div>
        <div>
          1. OS: Ubuntu 20.04.6 LTS <br />
          2. CPU: AMD Ryzen 9 5900X 12-Core Processor <br />
          3. GPU: NVIDIA GeFore RTX 3090
        </div>
      </>,
  },
  {
    label: 'Verify Requirements',
    description: `Verify the necessary requirements before running the OCR server.`,
  },
  {
    label: 'Run the container',
    description: `Once you're satisfied with the configurations and all the requirements are met, 
                  you may initialize the server.`,
  }
];

export default function HorizontalLinearStepper({
  error, setError,
  ocrLogs, setOCRLogs,
  dirHandle, setDirHandle,
  imagePreview, setImagePreview,
  rowFetchLoadingState, setRowFetchLoadingState,
  rows, setRows,
  rowSelectionModel, setRowSelectionModel,
  settings, setSettings, readConfigs,
  imagePulling, setImagePulling,
  imagePullProgress, setImagePullProgress,
}) {

  const socketRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [configSaving, setConfigSaving] = React.useState(false);
  const [openBackdrop, setOpenBackdrop] = React.useState(false);
  /* ---------- Snackbar Hooks ---------- */
  const [configSnackbar, setConfigSnackbar] = React.useState({
    open: false,
    status: "info",
    msg: "",
  });
  const handleCloseSnackbar = () => {
    setConfigSnackbar({ ...configSnackbar, open: false });
  };

  /* ---------- Dialog Hooks ---------- */
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  React.useEffect(() => {
    socketRef.current = io('http://localhost:7000');

    // Clean up the WebSocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const isStepOptional = (step) => {
    //return step === 1;
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = async () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    // Different action for each step's action buttons
    if (activeStep === 0) {
      setConfigSaving(true);
      // Save the configuration to the server
      const envChangeResponse = await handleEnvChange();
      let status = "success", msg = "Configuration saved.";

      // Sleep for 1.0s for interaction effect
      await new Promise(r => setTimeout(r, 1000));

      // Configure snackbar content
      if (envChangeResponse.status !== 201) {
        status = "warning"
        msg = "Failed to save configuration."
      }
      setConfigSnackbar({ open: true, status: status, msg: msg });

      setConfigSaving(false);

      await handleRunContainer();

      setActiveStep((prevActiveStep) => prevActiveStep + 1);

    } else if (activeStep === 2) {
      handleClickOpenDialog();

    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const ActionButtons = ({ disabled = false }) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>

        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>

        <Box sx={{ flex: '1 1 auto' }} />
        {
          isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
              Skip
            </Button>
          )
        }

        <Box sx={{ position: 'relative' }}>
          <Button
            disabled={(activeStep === 0 && disabled) || configSaving}
            onClick={handleNext}
          >
            {activeStep === 0 ? 'Save' : (activeStep === steps.length - 1 ? 'Run' : 'Next')}
          </Button>
          {
            configSaving && (
              <CircularProgress
                size={15}
                sx={{
                  color: green[500],
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-8px',
                  marginLeft: '-6px',
                }}
              />
            )
          }
        </Box>
      </Box>
    )
  }

  /* ---------- Container and Server handlers ----------  */
  const handleRunContainer = async () => {
    /* Restart Docker Container with the new configuration */
    // Open backdrop
    setOpenBackdrop(true);

    const runContainerResponse = await fetchRunContainer();

    // Sleep for 1.0s for interaction effect
    await new Promise(r => setTimeout(r, 3000));

    // Close backdrop
    setOpenBackdrop(false);

    // Error handling
    if (runContainerResponse.status !== 200) {
      setError({ type: "error", msg: "Failed to restart container with the new configuration." })
    }
  }

  const fetchRunContainer = async () => {
    let response, data;
    try {
      response = await fetch('http://localhost:7000/run_container', { method: "POST", });
      console.log("'/run_container' response:", response);
      return response;

    } catch (err) {
      console.log(err);
      // Error handling
      setError({ type: "error", msg: "Failed to restart container with the new configuration." })
      return null;
    }
  }

  const handleRunServer = async () => {
    handleCloseDialog();

    // Write the latest configuration
    setConfigSaving(true);
    // Save the configuration to the server
    const envChangeResponse = await handleEnvChange(true);
    let status = "success", msg = "Configuration saved.";

    // Sleep for 1.0s for interaction effect
    await new Promise(r => setTimeout(r, 1000));

    // Configure snackbar content
    if (envChangeResponse.status !== 201) {
      status = "warning"
      msg = "Failed to save configuration."
    }

    await handleRunContainer();

    // Hide Stepper, and display Configuration summary
    setSettings({ ...settings, configured: true });

    socketRef.current.emit('run_containerServer');

    // Sleep for 0.1s for summary page to load
    await new Promise(r => setTimeout(r, 100));

    // Trigger onClick event on "Update All" button to update the container and server status
    const button = document.querySelector('#summary_updateAll');
    button.click();
  };

  /* ---------- Configuration handlers ----------*/
  const handleResetConfiguration = async () => {
    if (await resetConfiguration() !== null) {
      // Read configurations
      await readConfigs();

      // Success handling
      setConfigSnackbar({ open: true, status: "success", msg: "Configuration successfully reset to default." });
    }
  }
  const resetConfiguration = async () => {
    let response, data;
    try {
      response = await fetch('http://localhost:7000/reset_env', { method: "POST", });
      console.log("'/reset_env' response:", response);
      return response;

    } catch (err) {
      console.log(err);
      // Error handling
      setError({ type: "error", msg: "Failed to reset configuration." })
      return null;
    }
  }
  const handleEnvChange = async (configured=null) => {
    /* Saving the configuration params to the Flask backend */
    const response = await fetch('/write_env', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        'CONFIGURED': configured === null? settings.configured.toString(): configured.toString(),
        'USE_GPU': settings.processor.toString(),
        'GPU_MEM': settings.gpu_mem.toString(),
        'CPU_THREADS': settings.gpu_mem.toString(),
        'CAM_POS': settings.cam_pos.toString(),
        'INPUT_TYPE': settings.inputs.type.toString(),
        'IMAGE_DIR': settings.inputs.image_dir.toString(),
        'DRAW_IMG_SAVE_DIR': settings.inputs.output_dir.toString(),
        'DET_LIMIT_SIDE_LEN': settings.inputs.img_side_limit.toString(),
        'GROUND_TRUTH_PATH': settings.inputs.ground_truth_path.toString(),
        'SAVE_LOG_PATH': settings.inputs.log_output.toString(),
        'SHOW_LOG': settings.inputs.show_log.toString(),
        'REQ_DOCKER': settings.requirements.isDocker.toString(),
        'REQ_IMAGE': settings.requirements.isImage.toString(),
        'REQ_NVIDIA': settings.requirements.isNvidia.toString(),
        'REQ_CUDA': settings.requirements.isCUDA.toString(),
        'REQ_CAM': settings.requirements.isCam.toString(),
        'STAT_CONTAINER': settings.status.container.toString(),
        'STAT_SERVER': settings.status.server.toString(),
        'MSG_DOCKER': settings.message.isDocker.toString(),
        'MSG_IMAGE': settings.message.isImage.toString(),
        'MSG_NVIDIA': settings.message.isNvidia.toString(),
        'MSG_CUDA': settings.message.isCUDA.toString(),
        'MSG_CAM': settings.message.isCam.toString(),
      })
    });

    console.log("'/write_env' response:", response);
    return response;
  }


  /* ---------- Compute if the container is ready to run ---------- */
  let configRun = true, reqRun = true;
  let msg = "All set, you're ready to run the OCR docker container";

  if (settings.inputs.image_dir === "" || settings.inputs.output_dir === "") {
    configRun = false;
    msg = "Missing some configurations please revisit 'OCR Configurations' step.";
  }

  if (!settings.requirements.isDocker || !settings.requirements.isImage || (settings.processor === 'gpu' && !settings.requirements.isNvidia) || !settings.requirements.isCUDA) {
    reqRun = false;

    if (configRun) {
      msg = "Some requirements are unfulfilled, please revisit 'Verify Requirements' step.";
    } else {
      msg = "Missing some configurations and requirements, please revisit 'OCR Configurations' and 'Verify Requirements' steps respectively";
    }
  }


  return (
    <Paper elevation={2} sx={{ width: '100%', p: 3, pt: 5, borderRadius: 2 }}>
      <SimpleBackdrop openBackdrop={openBackdrop} setOpenBackdrop={setOpenBackdrop} />
      <Snackbar
        open={configSnackbar.open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={configSnackbar.status} sx={{ width: '100%' }}>
          {configSnackbar.msg}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Initialize the backend server?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Allowing the interface to run the backend server in the Docker container.
            This action will send a request from the frontend to flask server to execute the command using Docker API.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseDialog}>Disagree</Button>
          <Button onClick={handleRunServer} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>


      <Stepper activeStep={activeStep} >
        {steps.map((step, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {
        activeStep === 0 ? (

          // 1st Step
          <React.Fragment>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
              <Grid item xs={10} >
                <Typography variant="caption" sx={{ px: 4, pt: 3 }} display="block" >{steps[activeStep].description}</Typography>
              </Grid>
              <Grid item xs={2} >
                <Button variant='outlined' size="small" color="error" sx={{ mt: 3 }} onClick={handleResetConfiguration}>Reset to Default</Button>
              </Grid>
            </Grid>

            <Box sx={{ minHeight: '50vh', mt: 3, mb: 2, mx: 3 }}>
              <MainConfig
                error={error} setError={setError}
                dirHandle={dirHandle} setDirHandle={setDirHandle}
                imagePreview={imagePreview} setImagePreview={setImagePreview}
                rowFetchLoadingState={rowFetchLoadingState} setRowFetchLoadingState={setRowFetchLoadingState}
                rows={rows} setRows={setRows}
                rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel}
                settings={settings} setSettings={setSettings}
              />
            </Box>
            <ActionButtons disabled={!configRun} />

          </React.Fragment>

        ) : (activeStep === 1 ? (

          // 2th Step
          <React.Fragment>
            <Typography variant="caption" sx={{ px: 4, pt: 3 }} display="block" >{steps[activeStep].description}</Typography>
            <Box sx={{ minHeight: '50vh', mt: 3, mb: 2, mx: 3 }}>
              <VerifyRequirements
                settings={settings} setSettings={setSettings}
                imagePullProgress={imagePullProgress} setImagePullProgress={setImagePullProgress}
                imagePulling={imagePulling} setImagePulling={setImagePulling}
              />
            </Box>
            <ActionButtons />

          </React.Fragment>

        ) : (activeStep === 2 ? (
          // 3rd Step
          <React.Fragment>
            <Typography variant="caption" sx={{ px: 4, pt: 3 }} display="block" >{steps[activeStep].description}</Typography>
            <Box sx={{ minHeight: '50vh', mt: 3, mb: 2, mx: 3, pt: 2 }}>
              <RunContainer
                run={configRun && reqRun}
                msg={msg}
              />
            </Box>
            <ActionButtons disabled={!(configRun && reqRun)} />

          </React.Fragment>

        ) : null
        )


        )
      }
    </Paper>

  );
}