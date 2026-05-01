import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Tea] Error boundary caught:', error, errorInfo.componentStack);
    if (typeof window !== 'undefined' && (window as Window & { ventDebug?: unknown }).ventDebug) {
      console.error('[Tea] debug payload:', (window as Window & { ventDebug?: unknown }).ventDebug);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or returning home.
              </p>
              {this.state.error && (
                <details className="text-left mb-6 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error details
                  </summary>
                  <code className="text-xs text-muted-foreground break-all">
                    {this.state.error.toString()}
                  </code>
                </details>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReload} variant="default" size="lg">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={this.handleReset} variant="outline" size="lg">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
