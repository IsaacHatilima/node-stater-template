import "dotenv/config";
import { container } from "../../lib/container";
import ms from "ms";
export default async function RefreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ errors: ["No refresh token"] });
        }
        const tokens = await container.refreshTokenService.refresh(refreshToken);
        const isProduction = process.env.NODE_ENV === "production";
        const refreshMaxAge = ms((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"));
        const accessMaxAge = ms((process.env.JWT_ACCESS_EXPIRES_IN ?? "120m"));
        res.cookie("refresh_token", tokens.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            path: "/auth",
            maxAge: refreshMaxAge,
        });
        res.cookie("access_token", tokens.access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: accessMaxAge,
        });
        return res.json({
            message: "Token refreshed",
        });
    }
    catch (error) {
        if (error.message === "INVALID_OR_EXPIRED_REFRESH_TOKEN") {
            return res.status(401).json({ errors: ["Invalid or expired refresh token"] });
        }
        return res.status(500).json({
            error: error.message,
            stack: error.stack,
        });
        //return res.status(500).json({errors: ["Something went wrong"]});
    }
}
