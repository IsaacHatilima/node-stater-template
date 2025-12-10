import "dotenv/config";
import { container } from "../../lib/container";
export default async function LogoutController(req, res) {
    const refreshToken = req.cookies?.refresh_token;
    const isProduction = process.env.NODE_ENV === "production";
    if (!refreshToken) {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            path: "/",
        });
        return res.status(200).json({ message: "Logged out" });
    }
    await container.logoutService.logout(refreshToken);
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/auth",
    });
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
    });
    return res.json({ message: "Logged out." });
}
