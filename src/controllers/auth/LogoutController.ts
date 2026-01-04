import "dotenv/config";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {success} from "../../lib/response";
import {clearAuthCookies} from "../../lib/auth-cookies";


export default async function LogoutController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const refreshToken = req.cookies?.refresh_token;


    try {
        if (!refreshToken) {
            clearAuthCookies(res);
            return success(res, {message: "Logged out."});
        }

        await container.logoutService.logout(refreshToken);

        clearAuthCookies(res);

        return success(res, {message: "Logged out."});
    } catch (error) {
        next(error);
    }
}

