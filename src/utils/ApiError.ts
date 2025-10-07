export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message)
    this.name = "Api Error"
    Error.captureStackTrace?.(this, this.constructor)
  }
}
