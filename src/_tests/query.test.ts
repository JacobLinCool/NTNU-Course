import query from "../";

jest.setTimeout(30000);

describe("query.meta", () => {
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

describe("query.info", () => {
    it("should throw Error", async () => {
        const meta = await query.meta({
            serial: 963,
        });
        const m = JSON.parse(JSON.stringify(meta[0]));
        m.year = 100;
        await expect(query.info(m)).rejects.toThrow();
    });

    it("should return info of a GU course", async () => {
        const meta = await query.meta({
            serial: 963,
        });
        const info = await query.info(meta[0]);

        expect(info.serial).toBe(963);
        expect(info.hours).toBe(2);
        expect(info.general_core).toEqual(["邏輯運算"]);
        expect(info.goals).toHaveLength(4);
    });

    it("should return info of a CSIE course", async () => {
        const meta = await query.meta({
            serial: 2954,
        });
        const info = await query.info(meta[0]);

        expect(info.serial).toBe(2954);
        expect(info.hours).toBe(3);
        expect(info.general_core).toEqual([]);
        expect(info.goals).toHaveLength(2);
        expect(info.prerequisite).toBe("◎必須先修過【CSU0001  程式設計（一）】");
    });

    it("should work with cache", async () => {
        const time = Date.now();
        const meta = await query.meta({
            serial: "963",
        });
        const info = await query.info(meta[0]);

        expect(info.serial).toBe(963);
        expect(info.hours).toBe(2);
        expect(info.general_core).toEqual(["邏輯運算"]);
        expect(info.goals).toHaveLength(4);
        expect(Date.now() - time).toBeLessThan(100);
    });

    it("should clear cache", async () => {
        query.clear();

        const meta = await query.meta({
            serial: "963",
        });

        const time = Date.now();
        const info = await query.info(meta[0]);

        expect(info.serial).toBe(963);
        expect(info.hours).toBe(2);
        expect(info.general_core).toEqual(["邏輯運算"]);
        expect(info.goals).toHaveLength(4);
        expect(Date.now() - time).toBeGreaterThan(100);
    });
});
