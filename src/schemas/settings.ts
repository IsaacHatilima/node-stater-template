import {z} from "zod";
import {passwordSchema} from "./auth";

export const passwordUpdateSchema = z.object({
    current_password: z.string(),
    password: passwordSchema,
    password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
});

export const profileUpdateSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
});

export const deleteAccountSchema = z.object({
    password: z.string(),
});
