import {Request, Response} from "express";
import {container} from "../../lib/container";

export default async function LoginController(req: Request, res: Response) {
    try {
        const result = await container.loginService.login(req.body);
        const isProduction = process.env.APP_ENV === "production";

        res.cookie("refresh_token", result.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            path: "/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            message: "Logged in",
            user: result.user,
            access_token: result.access_token,
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
