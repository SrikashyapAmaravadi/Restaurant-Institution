import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0E14',
          color: '#fff',
          padding: 24,
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: 600,
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 12,
            padding: 24
          }}>
            <h2 style={{ color: '#EF4444', marginBottom: 12, fontSize: '1.4rem' }}>
              Application Render Error
            </h2>
            <p style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>
              {this.state.error?.message || String(this.state.error)}
            </p>
            <pre style={{
              background: 'rgba(0,0,0,0.5)',
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              color: '#94A3B8',
              overflowX: 'auto',
              maxHeight: 200,
              marginBottom: 16
            }}>
              {this.state.error?.stack || this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => {
                localStorage.removeItem('dine_bennett_user');
                localStorage.removeItem('dine_bennett_token');
                window.location.href = '/login';
              }}
              style={{
                background: '#4F46E5',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Session &amp; Go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

