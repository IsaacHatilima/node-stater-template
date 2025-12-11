import request from "supertest";
import {createApp} from "../../../app";
import {createAuthUser} from "../../test-helpers";

const app = createApp();

describe("PUT /settings/update-password", () => {
    it("user can update password", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-password")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                current_password: "Password1#",
                password: "Password1#",
                password_confirm: "Password1#"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Password changed successfully.");
    });

    it("user cannot update password with wrong current password", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-password")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                current_password: "Password13#",
                password: "Password1#",
                password_confirm: "Password1#"
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid password.");
    });

    it("user cannot update password with mismatched passwords", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-password")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                current_password: "Password1#",
                password: "Password12#",
                password_confirm: "Password1#"
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toContain("Passwords do not match.");
    });
});