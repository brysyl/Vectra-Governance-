import React from 'react';
export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{color:'red', padding:20}}>System Error Caught.</div>;
    return this.props.children;
  }
}
