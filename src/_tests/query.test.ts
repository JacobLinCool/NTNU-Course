import query from "../";

describe("meta", () => {
    jest.setTimeout(30000);

    it("should throw Error", async () => {
        await expect(query.meta({})).rejects.toThrow();
    });

    it("should return meta list of GU courses", async () => {
        const meta = await query.meta({
            general_core: "all",
        });

        expect(meta).toHaveLength(172);
    });

    it("should return meta list of courses taught by Mr. 蔣宗哲", async () => {
        const meta = await query.meta({
            teacher: "蔣宗哲",
        });

        expect(meta).toHaveLength(3);
    });

    it("should return meta list of courses provided by 資工系", async () => {
        const meta = await query.meta({
            department: "資工系",
        });

        expect(meta).toHaveLength(24);
    });

    it("should return meta list of courses provided by 台大碩士", async () => {
        const meta = await query.meta({
            department: "9MAA",
        });

        expect(meta).toHaveLength(567);
    });

    it("should work with cache", async () => {
        const time = Date.now();
        const meta = await query.meta({
            department: "9MAA",
        });
        expect(meta).toHaveLength(567);
        expect(Date.now() - time).toBeLessThan(100);
    });

    it("should clear cache", async () => {
        query.clear();

        const time = Date.now();
        const meta = await query.meta({
            teacher: "蔣宗哲",
        });
        expect(meta).toHaveLength(3);
        expect(Date.now() - time).toBeGreaterThan(100);
    });
});
