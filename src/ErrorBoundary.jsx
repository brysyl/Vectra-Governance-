
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Bypassed error:", error);
  }

  render() {
    return this.props.children;
  }
}
export default ErrorBoundary;
