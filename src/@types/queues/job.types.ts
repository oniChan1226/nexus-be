
export interface EmailJobs {
    sendOtpEmail: { email: string, otp: string };
}

export type QueueNames = "otpQueue";