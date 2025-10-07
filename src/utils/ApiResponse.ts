export class ApiResponse<T> {
  constructor(
    public status: number,
    public message: string,
    public data: T | null = null,
    public success: boolean = status < 400
  ) {}

  // ✅ 1. Generic success
  static success<T>(data: T, message = "Success", status = 200) {
    return new ApiResponse<T>(status, message, data, true)
  }

  // ✅ 2. Created resource
  static created<T>(data: T, resourceName = "Resource") {
    return new ApiResponse<T>(
      201,
      `${resourceName} created successfully`,
      data,
      true
    )
  }

  // ✅ 3. Updated resource
  static updated<T>(data: T, resourceName = "Resource") {
    return new ApiResponse<T>(
      200,
      `${resourceName} updated successfully`,
      data,
      true
    )
  }

  // ✅ 4. Deleted resource
  static deleted<T>(data: T | null = null, resourceName = "Resource") {
    return new ApiResponse<T>(
      200,
      `${resourceName} deleted successfully`,
      data,
      true
    )
  }
}
