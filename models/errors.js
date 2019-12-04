class ModelError extends Error {
  constructor(type, exception, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ModelError)
    }

    // Custom debugging information
    this.type = type
    this.exception = exception
  }
}

export { ModelError }
