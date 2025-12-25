import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  async componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to database
    try {
      await base44.entities.SystemLog.create({
        log_type: 'error',
        severity: 'critical',
        component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
        message: error.toString(),
        data: {
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl bg-red-900/20 border-red-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                The application encountered an error. The issue has been logged automatically.
              </p>
              <details className="bg-slate-800 p-4 rounded-lg">
                <summary className="text-white font-bold cursor-pointer mb-2">Error Details</summary>
                <pre className="text-xs text-red-400 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;