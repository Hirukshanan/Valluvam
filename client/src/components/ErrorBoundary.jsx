import React, { Component } from 'react';

/**
 * Valluvam-styled default error fallback screen.
 * Does not expose any stack traces, file paths, secrets, or technical details.
 */
function DefaultErrorFallback({ onReset, onGoHome }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bronze-50/50 px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-bronze-200/80 bg-white p-8 sm:p-10 shadow-sm text-center">
        {/* Subtle decorative icon */}
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bronze-100 text-bronze-600"
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Decorative accent bar */}
        <div aria-hidden="true" className="mx-auto mb-5 h-1 w-12 rounded-full bg-bronze-400" />

        <h1 className="text-2xl font-bold tracking-tight text-charcoal-950 sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mt-4 text-base leading-7 text-charcoal-700">
          An unexpected error occurred while loading this page. Please try again or return to the homepage.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 cursor-pointer"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-bronze-300 bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-950 transition-colors hover:border-bronze-500 hover:bg-bronze-50 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Global React Error Boundary component.
 * Catches unhandled runtime/rendering errors in child components to prevent blank screens.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('Unhandled React error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              resetErrorBoundary: this.handleReset,
              goHome: this.handleGoHome,
            })
          : this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
