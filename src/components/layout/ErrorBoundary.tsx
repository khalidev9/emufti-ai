import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {this.props.fallbackTitle || 'Unable to Load Page'}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We encountered an unexpected issue while rendering this section of EMufti AI.
                Your session and saved data remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-muted/60 border border-border text-left overflow-auto max-h-36">
                <span className="text-[10px] font-mono font-bold text-destructive block">
                  {this.state.error.name}: {this.state.error.message}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <a
                href="/chat"
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Go to Chat</span>
              </a>
              <a
                href="/dashboard"
                className="py-2.5 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                title="Dashboard"
              >
                <Home className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
