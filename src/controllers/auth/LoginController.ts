import "dotenv/config";
import {Request, Response} from "express";
import {container} from "../../lib/container";
import ms from "ms";

export default async function LoginController(req: Request, res: Response) {
    try {
        const result = await container.loginService.login(req.body);
        const isProduction = process.env.APP_ENV === "production";
        const refreshMaxAge = ms((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as ms.StringValue);
        const accessMaxAge = ms((process.env.JWT_ACCESS_EXPIRES_IN ?? "120m") as ms.StringValue);

        res.cookie("refresh_token", result.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            path: "/auth",
            maxAge: refreshMaxAge,
        });

        res.cookie("access_token", result.access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: accessMaxAge,
        });

        return res.json({
            message: "Logged in",
            user: result.user,
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });

    } catch (error: any) {
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
