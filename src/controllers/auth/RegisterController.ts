import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

const registerSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
});
export default async function RegisterController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        const user = await container.registerService.register(req.body);
        return res.status(201).json({
            message: "Registered successfully.",
            user,
        });
    } catch (error: any) {
        next(error);
    }
}
