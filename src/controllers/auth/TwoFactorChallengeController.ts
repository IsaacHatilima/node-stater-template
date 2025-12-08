import {Request, Response} from "express";
import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/set-auth-cookies";
import {prisma} from "../../config/db";

export async function TwoFactorChallengeController(req: Request, res: Response) {
    try {
        const {challenge_id, code} = req.body as { challenge_id: string; code: string };
        if (!challenge_id || !code) return res.status(422).json({errors: ["challenge_id and code are required"]});
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
        const msg = error.message;
        if (msg === "TFA_CHALLENGE_NOT_FOUND")
            return res.status(400).json({errors: ["Challenge not found or expired."]});
        if (msg === "INVALID_TFA_TOKEN")
            return res.status(400).json({errors: ["Invalid 2FA token or code."]});
        return res.status(500).json({error: "Something went wrong."});
    }
}