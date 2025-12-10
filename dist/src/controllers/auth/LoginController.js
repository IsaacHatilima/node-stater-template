import "dotenv/config";
import { container } from "../../lib/container";
import { setAuthCookies } from "../../lib/set-auth-cookies";
export default async function LoginController(req, res) {
    try {
        const result = await container.loginService.login(req.body);
        if (result.two_factor_required) {
            return res.status(200).json({
                message: "Two-factor authentication required",
                two_factor_required: true,
                challenge_id: result.challenge_id,
                user: result.user,
            });
        }
        setAuthCookies(res, {
            access: result.access_token,
            refresh: result.refresh_token,
        });
        return res.json({
            message: "Logged in",
            user: result.user,
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });
    }
    catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return res.status(404).json({
                errors: ["Invalid Email or Password"],
            });
        }
        return res.status(500).json({
            error: "Something went wrong",
        });
    }
}
