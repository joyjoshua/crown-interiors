import { Component } from 'react';
import './ErrorBoundary.css';

/**
 * Global Error Boundary — catches unhandled JS errors in the React tree
 * and renders a friendly fallback instead of a white screen crash.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to console in development; in production, send to error reporting service
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary__card">
                        {/* Icon */}
                        <div className="error-boundary__icon">
                            <svg
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        {/* Message */}
                        <h1 className="error-boundary__title">Something went wrong</h1>
                        <p className="error-boundary__message">
                            An unexpected error occurred. Don&apos;t worry — your data is safe.
                        </p>

                        {/* Error details (dev only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="error-boundary__details">
                                <summary>Error Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}

                        {/* Actions */}
                        <div className="error-boundary__actions">
                            <button
                                className="error-boundary__btn error-boundary__btn--primary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="error-boundary__btn error-boundary__btn--secondary"
                                onClick={this.handleReload}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
