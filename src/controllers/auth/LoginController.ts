import "dotenv/config";
import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/set-auth-cookies";
import {NextFunction, Request, Response} from "express";
import {z} from "zod";

const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export default async function LoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

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
            refresh: result.refresh_token!,
            access: result.access_token!,
        });

        return res.json({
            message: "Logged in",
            user: result.user,
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });
    } catch (error) {
        next(error);
    }
}
