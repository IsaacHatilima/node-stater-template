import { z } from "zod";
import { container } from "../../lib/container";
const passwordUpdateSchema = z.object({
    current_password: z.string(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
});
export default async function UpdatePasswordController(req, res) {
    try {
        const parsed = passwordUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.updatePasswordService.updatePassword(parsed.data, req.user);
        return res.json({
            message: "Password changed successfully.",
        });
    }
    catch (error) {
        const msg = error.message;
        if (msg === "INVALID_PASSWORD")
            return res.status(400).json({ errors: ["Invalid Password."] });
        return res.status(500).json({ error: "Something went wrong." });
    }
}
