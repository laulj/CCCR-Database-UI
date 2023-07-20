import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [outputs, setOutputs] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [volumeEnv, setVolumeEnv] = useState('');

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`connected!`);
    });
    // Event handler for receiving output from the server
    socket.on('output', (data) => {
      // Convert ANSI escape codes to HTML
      console.log("data:", data);

      // Remove ANSI escape codes
      const sanitizedOutput = sanitizeOutput(data);
      setOutputs(prevOutput=>[...prevOutput, sanitizedOutput]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sanitizeOutput = (output) => {
    // Remove control characters from output
    const sanitizedOutput = output.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    return sanitizedOutput;
  };

  useEffect(() => {
    console.log("outptus", outputs);
  }, [outputs]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    socket.emit('input', { input: inputValue });
    setInputValue('');
  };

  const handleEnvChangeFormSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/write_env', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        'INPUT_DIR': volumeEnv,
        'OUTPUT_DIR': volumeEnv,
      },
      )
    });
    
    console.log("'/write_env' response:", response);
  }

  return (
    <div>
      <h1>Container Output:</h1>
      <pre>{outputs.map((output, index) => <div key={index}>{output}</div>)}</pre>

      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter input..."
        />
        <button type="submit">Send</button>
      </form>

      <form onSubmit={handleEnvChangeFormSubmit}>
        <input
          type="text"
          value={volumeEnv}
          onChange={(e)=> setVolumeEnv(e.target.value)}
          placeholder="Enter volume dir..."
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
