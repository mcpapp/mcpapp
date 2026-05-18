import { createContext, useContext } from "react";
import type { MCPAppRuntime } from "./types";

export const MCPHostRuntimeContext = createContext<MCPAppRuntime | null>(null);

export function useMCPHostRuntime(): MCPAppRuntime | null {
  return useContext(MCPHostRuntimeContext);
}
