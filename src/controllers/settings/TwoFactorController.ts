import {Request, Response} from "express";
import {container} from "../../lib/container";

export async function TwoFASetupController(req: Request, res: Response) {
    try {
        const result = await container.twoFactorService.initiateSetup(req.user);
        return res.json({
            message: "2FA setup initiated",
            ...result,
        });
    } catch (error: any) {
        const msg = error.message;
        if (msg === "USER_NOT_FOUND")
            return res.status(404).json({errors: ["User not found."]});
        return res.status(500).json({error: "Something went wrong."});
    }
}

export async function TwoFAEnableController(req: Request, res: Response) {
    try {
        const {code} = req.body as { code: string };
        if (!code) return res.status(422).json({errors: ["Token is required"]});
        const result = await container.twoFactorService.verifyAndEnable({code}, req.user);
        return res.json({message: "2FA enabled", ...result});
    } catch (error: any) {
        const msg = error.message;
        if (msg === "TFA_SETUP_NOT_FOUND")
            return res.status(400).json({errors: ["Setup not found or expired."]});
        if (msg === "INVALID_TFA_TOKEN")
            return res.status(400).json({errors: ["Invalid 2FA token."]});
        return res.status(500).json({error: "Something went wrong."});
    }
}

export async function TwoFADisableController(req: Request, res: Response) {
    try {
        const {code, backup_code} = req.body as { code?: string; backup_code?: string };
        const result = await container.twoFactorService.disable({code, backup_code}, req.user);
        return res.json({message: "2FA disabled", ...result});
    } catch (error: any) {
        const msg = error.message;
        if (msg === "USER_NOT_FOUND")
            return res.status(404).json({errors: ["User not found."]});
        if (msg === "INVALID_TFA_VERIFICATION")
            return res.status(400).json({errors: ["Invalid token or backup code."]});
        return res.status(500).json({error: "Something went wrong."});
    }
}

export async function TwoFARegenerateCodesController(req: Request, res: Response) {
    try {
        const result = await container.twoFactorService.regenerateBackupCodes(req.user);
        return res.json({message: "Backup codes regenerated", ...result});
    } catch (error: any) {
        const msg = error.message;
        if (msg === "USER_NOT_FOUND")
            return res.status(404).json({errors: ["User not found."]});
        if (msg === "TFA_NOT_ENABLED")
            return res.status(400).json({errors: ["2FA is not enabled."]});
        return res.status(500).json({error: "Something went wrong."});
    }
}


