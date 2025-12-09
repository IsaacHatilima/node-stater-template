import request from "supertest";
import {createApp} from "../../../app";
import {createAuthUser} from "../../test-helpers";

const app = createApp();

describe("PUT /settings/update-profile", () => {
    it("user can update profile", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-profile")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "john.doe@example.com"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Profile Updated successfully.");
    });

    it("user cannot update profile with invalid first name", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-profile")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                first_name: "J",
                last_name: "Doe",
                email: "john.doe@example.com"
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toBeDefined();
    });

    it("user cannot update profile with invalid email", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .put("/settings/update-profile")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "invalid-email"
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toBeDefined();
    });
});
