import { sleep, retry, obj_to_hash } from "../utils";

describe("utils", () => {
    it("should sleep", async () => {
        const time = Date.now();
        await sleep(100);
        expect(Date.now() - time).toBeGreaterThan(95);
    });

    it("should retry", async () => {
        let err = null;
        try {
            await retry(() => Promise.reject("error"));
        } catch (e) {
            err = e;
        }
        expect(err).toBe("error");
    });

    it("should obj_to_hash", () => {
        expect(obj_to_hash({ a: 1, b: 2 })).toBe("608de49a4600dbb5b173492759792e4a");
    });
});
