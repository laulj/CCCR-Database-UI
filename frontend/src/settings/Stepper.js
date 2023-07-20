import io from 'socket.io-client';
import * as React from 'react';
import {
  Grid, Box, Paper, Divider, Button, Typography,
  Stepper, Step, StepLabel,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import MainConfig from './S1_MainConfig';
import VerifyRequirements from './S2_VerifyRequirements';
import RunContainer from './S3_Container';

const steps = [
  {
    label: 'OCR Configurations',
    description: `Before initiating the OCR, the inputs below control and affect the performance of the OCR.
                  You may configure it optimally respect to your machine.`,
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
  dirHandle, setDirHandle,
  imagePreview, setImagePreview,
  rowFetchLoadingState, setRowFetchLoadingState,
  rows, setRows,
  rowSelectionModel, setRowSelectionModel,
  settings, setSettings,
}) {

  const socketRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  /*React.useEffect(() => {
    socketRef.current = io('http://localhost:7000');

    // Clean up the WebSocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);*/

  const isStepOptional = (step) => {
    //return step === 1;
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    // Different action for each step's action buttons
    if (activeStep === 2) {
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

  const handleStartServer = () => {
    setSettings({ ...settings, configured: true });
    //socketRef.current.emit('start_containerServer');
  };



  /* ---------- PullImage Hooks ---------- */
  const [imagePullProgress, setImagePullProgress] = React.useState([]);
  const [imagePulling, setImagePulling] = React.useState(false);

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
        {/* <Button disabled={disabled && activeStep === steps.length - 1} onClick={handleNext}> */}
        <Button disabled={activeStep === 0 && disabled} onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Run' : 'Next'}
        </Button>

      </Box>
    )
  }

  const handleEnvChange = async (e) => {
    e.preventDefault();
    const response = await fetch('/write_env', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        'USE_GPU': settings.processor,
        'GPU_MEM': settings.gpu_mem,
        'CPU_THREADS': settings.gpu_mem,
        'CAM_POS': settings.cam_pos,
        'INPUT_TYPE': settings.inputs.type,
        'IMAGE_DIR': settings.inputs.image_dir,
        'DRAW_IMG_SAVE_DIR': settings.inputs.output_dir,
        'DET_LIMIT_SIDE_LEN': settings.inputs.img_side_limit,
        'SAVE_LOG_PATH': settings.inputs.log_output,
      },
      )
    });

    console.log("'/write_env' response:", response);
  }

  // Compute if the container is ready to run
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

  /* ---------- Dialog Hooks ---------- */
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Paper elevation={2} sx={{ width: '100%', p: 3, pt: 5, borderRadius: 2 }}>
      <div>
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
            <Button onClick={() => { handleStartServer(); handleCloseDialog() }} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>

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
            <Typography variant="caption" sx={{ px: 4, pt: 3 }} display="block" >{steps[activeStep].description}</Typography>
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