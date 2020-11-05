class ApiError extends Error {
  public type: string;

  public exception: Error | null;

  constructor(type: string, exception: Error | null, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }

    // Custom debugging information
    this.type = type
    this.exception = exception
  }
}

export { ApiError }
