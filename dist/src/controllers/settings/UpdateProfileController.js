import { z } from "zod";
import { container } from "../../lib/container";
const profileUpdateSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
});
export default async function UpdateProfileController(req, res) {
    try {
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.updateProfileService.updateProfile(parsed.data, req.user);
        return res.json({
            message: "Profile Updated successfully.",
        });
    }
    catch (error) {
        const msg = error.message;
        if (msg === "USER_NOT_FOUND")
            return res.status(400).json({ errors: ["User not found."] });
        if (msg === "FAILED_TO_UPDATE_PROFILE")
            return res.status(400).json({ errors: ["Profile update failed. Try again."] });
        return res.status(500).json({ error: "Something went wrong." });
    }
}
