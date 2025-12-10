import { container } from "../../lib/container";
export default async function ForgotPasswordTokenCheckerController(req, res) {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ error: "Missing Token" });
    }
    try {
        const result = await container.forgotPasswordTokenCheckerService.checkPasswordToken(token);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error && error.message === "INVALID_PASSWORD_TOKEN") {
            return res.status(404).json({
                errors: ["Invalid Token Provided."],
            });
        }
        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
