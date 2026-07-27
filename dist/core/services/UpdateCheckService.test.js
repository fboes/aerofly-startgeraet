import { describe, it } from "node:test";
import assert from "node:assert";
import { UpdateCheckService } from "./UpdateCheckService.js";
await describe("UpdateCheckService", { skip: true }, async () => {
    await it("should fetch the the latest release payload from GitHub", async () => {
        const service = new UpdateCheckService("fboes", "aerofly-startgeraet");
        const payload = await service.makeGithubReleaseRequest();
        assert.ok(payload.html_url);
        assert.ok(payload.name);
        assert.ok(payload.tag_name);
    });
    await it("should give a result if local version is not latest release payload from GitHub", async () => {
        const service = new UpdateCheckService("fboes", "aerofly-startgeraet");
        const payload = await service.isUpdateAvailable("0.0.0");
        assert.ok(payload?.html_url);
        assert.ok(payload?.name);
        assert.ok(payload?.tag_name);
    });
    await it("should give a result if local version is not latest release payload from GitHub", async () => {
        const service = new UpdateCheckService("fboes", "aerofly-startgeraet");
        const payload = await service.makeGithubReleaseRequest();
        assert.ok(payload?.tag_name);
        const payload2 = await service.isUpdateAvailable(payload.tag_name);
        assert.ok(payload2 === null);
    });
});
