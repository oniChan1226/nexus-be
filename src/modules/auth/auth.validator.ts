import z from "zod";

// === SCHEMAS ===
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(20).trim(),
    email: z.email(),
    password: z.string().min(6).max(20),
    age: z.number().min(12).max(100).optional(),
    profileImage: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6).max(20),
  }),
});

// === TYPES ===
export type UserRegisterData = z.infer<typeof registerSchema>["body"];
export type UserLoginData = z.infer<typeof loginSchema>["body"];

// === GROUPED SCHEMAS ===
export const AuthValidator = {
  registerSchema,
  loginSchema,
};
