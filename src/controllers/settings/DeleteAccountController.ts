import {Request, Response} from "express";
import {z} from "zod";
import {container} from "../../lib/container";

const deleteProfileSchema = z.object({
    password: z.string(),
});
export default async function DeleteAccountController(req: Request, res: Response) {
    try {
        const parsed = deleteProfileSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        await container.deleteAccountService.deleteAccount(
            parsed.data,
            req.user
        );

        return res.json({
            message: "Profile Deleted successfully.",
        });
    } catch (error: any) {
        const msg = error.message;

        if (msg === "INVALID_PASSWORD")
            return res.status(401).json({errors: ["Invalid Password."]});

        return res.status(500).json({error: "Something went wrong."});
    }
}