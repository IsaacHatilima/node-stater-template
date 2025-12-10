import { container } from "../../lib/container";
export default async function MeController(req, res) {
    try {
        const user = await container.meService.getMe(req.user.id);
        return res.json({ user }); // @safe
    }
    catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                errors: ["User not found"]
            });
        }
        return res.status(500).json({
            error: "Something went wrong"
        });
    }
}
