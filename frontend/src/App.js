//import logo from './logo.svg';
/*import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';*/
import * as React from 'react';
//import { red } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './Layout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f6faff',
      paper: 'white',
    },
  },
  shape: {
    borderRadius: 4,
  }
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Layout theme={theme} />
    </ThemeProvider>
  );
}

export default App;
