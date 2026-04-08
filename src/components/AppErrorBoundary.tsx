import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logClientError } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logClientError(error, {
      componentStack: errorInfo.componentStack,
      source: "AppErrorBoundary",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-lg text-center">
            <h1 className="font-heading font-bold text-3xl text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The page hit an unexpected error. Refresh the page, or return home and try again.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => window.location.assign(window.location.href)}>Refresh</Button>
              <Button asChild variant="outline">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
