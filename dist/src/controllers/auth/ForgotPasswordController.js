import { z } from "zod";
import { container } from "../../lib/container";
const forgotPasswordSchema = z.object({
    email: z.email(),
});
export default async function ForgotPasswordController(req, res) {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.forgotPasswordService.requestLink(req.body);
        return res.json({
            message: "A reset link has been sent to your email.",
        });
    }
    catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                errors: ["User with this email not found."],
            });
        }
        return res.status(500).json({
            error: "Something went wrong.",
        });
    }
}
