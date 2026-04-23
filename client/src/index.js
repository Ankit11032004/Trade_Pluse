import React from 'react';
import ReactDOM from 'react-dom/client';
import './output.css'; // This is the file the CLI just created
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);