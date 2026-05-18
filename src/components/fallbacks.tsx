import type { ReactNode } from "react";

export function DefaultLoading(): ReactNode {
  return (
    <div data-mcpapp-state="loading" role="status">
      Loading
    </div>
  );
}

export function DefaultError({ error }: { error: Error }): ReactNode {
  return (
    <div data-mcpapp-state="error" role="alert">
      {error.message}
    </div>
  );
}
