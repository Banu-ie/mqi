type LogMeta = Record<string, unknown>;

function redact(value: string): string {
  return value
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://[redacted]")
    .replace(/\b(password|secret|token|authorization|host|server|database|user|port)=\S+/gi, "$1=[redacted]");
}

function errorMeta(error: unknown): LogMeta {
  if (!error || typeof error !== "object") return { name: "Error", message: redact(String(error)) };
  const candidate = error as { name?: unknown; message?: unknown; code?: unknown; constraint?: unknown };
  return {
    name: typeof candidate.name === "string" ? candidate.name : "Error",
    message: typeof candidate.message === "string" ? redact(candidate.message) : "Unknown error",
    ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
    ...(typeof candidate.constraint === "string" ? { constraint: candidate.constraint } : {}),
  };
}

function write(level: string, message: string, meta: LogMeta = {}) {
  console.log(JSON.stringify({ level, time: new Date().toISOString(), message, ...meta }));
}

export const logger = {
  info(message: string, meta?: LogMeta) { write("info", message, meta); },
  warn(message: string, meta?: LogMeta) { write("warn", message, meta); },
  error(error: unknown, message: string, meta?: LogMeta) { write("error", message, { ...errorMeta(error), ...meta }); },
};