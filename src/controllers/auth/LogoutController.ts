import "dotenv/config";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {env} from "../../utils/environment-variables";

function clearAuthCookies(res: Response, isProduction: boolean) {
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
}

export default async function LogoutController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const refreshToken = req.cookies?.refresh_token;
    const isProduction = env.NODE_ENV === "production";

    try {
        if (!refreshToken) {
            clearAuthCookies(res, isProduction);
            return res.json({message: "Logged out."});
        }

        await container.logoutService.logout(refreshToken);
        
        clearAuthCookies(res, isProduction);

        return res.json({message: "Logged out."});
    } catch (error) {
        next(error);
    }
}

