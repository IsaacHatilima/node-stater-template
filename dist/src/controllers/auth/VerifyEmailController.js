import { container } from "../../lib/container";
export default async function VerifyEmailController(req, res) {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(422).json({ errors: ["Verification token missing"] });
        }
        await container.emailVerificationService.verifyEmail(token);
        return res.json({
            message: "Email successfully verified."
        });
    }
    catch (e) {
        const msg = e.message;
        if (msg === "INVALID_OR_EXPIRED_TOKEN")
            return res.status(400).json({ errors: ["Invalid or expired token"] });
        if (msg === "ALREADY_VERIFIED")
            return res.status(400).json({ errors: ["Email already verified"] });
        if (msg === "USER_NOT_FOUND")
            return res.status(404).json({ errors: ["User not found"] });
        return res.status(500).json({ error: "Something went wrong" });
    }
}
