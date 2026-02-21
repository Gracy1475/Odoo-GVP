import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const displayError = (title, message) => {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="padding: 2.5rem; color: #dc2626; font-family: sans-serif; background: #fef2f2; min-height: 100vh;">
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">🚨 Frontend Runtime Error</h1>
                <p style="color: #991b1b; margin-bottom: 1.5rem; font-weight: 500;">${title}</p>
                <div style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #fee2e2; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                    <code style="font-family: monospace; font-size: 0.875rem; white-space: pre-wrap; word-break: break-all;">${message}</code>
                </div>
                <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Retry Application
                </button>
            </div>
        `;
    }
};

window.onerror = (msg, url, line, col, error) => {
    displayError('Uncaught Exception', `${msg}\n\nSource: ${url}\nLine: ${line}:${col}\n\nStack Trace:\n${error?.stack || 'N/A'}`);
    return false;
};

window.onunhandledrejection = (event) => {
    displayError('Unhandled Promise Rejection', `Reason: ${event.reason}\n\nDetails: ${JSON.stringify(event.reason)}`);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
