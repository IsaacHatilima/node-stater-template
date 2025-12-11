import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/set-auth-cookies";
import {prisma} from "../../config/db";
import {NextFunction, Request, Response} from "express";

export async function TwoFactorChallengeController(req: Request, res: Response, next: NextFunction) {
    try {
        const {challenge_id, code} = req.body;

        if (!challenge_id || !code) {
            return res.status(422).json({
                errors: ["challenge_id and code are required"],
            });
        }

        const result = await container.twoFactorChallengeService.verifyLoginCode({challenge_id, code});

        setAuthCookies(res, {
            access: result.access_token,
            refresh: result.refresh_token,
        });
        await prisma.user.update({
            where: {id: result.user.id},
            data: {last_login: new Date()}
        });

        return res.json({
            message: "2FA verified",
            user: result.user,
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });
    } catch (error: any) {
        next(error);
    }
}
