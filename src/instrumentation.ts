export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger");

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error("Unhandled promise rejection", reason, {
        errorCode: "UNHANDLED_REJECTION",
      });
    });

    process.on("uncaughtException", (err: Error) => {
      logger.error("Uncaught exception", err, {
        errorCode: "UNCAUGHT_EXCEPTION",
      });
    });
  }
};
