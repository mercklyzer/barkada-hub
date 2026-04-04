import { supabaseAdmin } from "@/lib/supabase-admin";

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  route?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  route?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  errorDetails?: unknown;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

const buildEntry = (
  level: LogLevel,
  message: string,
  error?: unknown,
  ctx?: LogContext,
): LogEntry => {
  const { route, method, statusCode, errorCode, ...rest } = ctx ?? {};
  const err = error instanceof Error ? error : undefined;
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    route,
    method,
    statusCode,
    errorCode,
    ...(error !== undefined && { errorDetails: error }),
    ...(err?.stack && { stackTrace: err.stack }),
    ...(Object.keys(rest).length > 0 && {
      metadata: rest as Record<string, unknown>,
    }),
  };
};

const persistToDb = async (entry: LogEntry): Promise<void> => {
  try {
    await supabaseAdmin.from("server_logs").insert({
      level: entry.level,
      message: entry.message,
      route: entry.route ?? null,
      method: entry.method ?? null,
      status_code: entry.statusCode ?? null,
      error_code: entry.errorCode ?? null,
      error_details:
        entry.errorDetails !== undefined ? entry.errorDetails : null,
      stack_trace: entry.stackTrace ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch {
    // Never let logging itself crash the app
    console.error("[logger] Failed to persist log to DB");
  }
};

export const logger = {
  info: (message: string, ctx?: LogContext): void => {
    const entry = buildEntry("info", message, undefined, ctx);
    console.log(JSON.stringify(entry));
  },

  warn: (message: string, ctx?: LogContext): void => {
    const entry = buildEntry("warn", message, undefined, ctx);
    console.warn(JSON.stringify(entry));
  },

  error: (message: string, error?: unknown, ctx?: LogContext): void => {
    const entry = buildEntry("error", message, error, ctx);
    console.error(JSON.stringify(entry));
    // Fire-and-forget — do not await
    persistToDb(entry);
  },
};
