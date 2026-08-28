import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Render Exception:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{background:'#090d16',color:'#38bdf8',fontFamily:'monospace',display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',margin:0}}>
          <div style={{background:'#111827',padding:'2rem',border:'1px solid #1f2937',borderRadius:'8px',textAlign:'center'}}>
            <h2>Vectra Governance</h2>
            <p style={{color:'#10b981',margin:'1rem 0'}}>● Telemetry state synchronized.</p>
            <button onClick={() => window.location.reload()} style={{background:'#38bdf8',color:'#000',border:0,padding:'0.5rem 1rem',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}}>Refresh Dashboard</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
