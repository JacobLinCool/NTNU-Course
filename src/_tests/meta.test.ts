import { get_meta_list } from "../meta";

describe("meta", () => {
    jest.setTimeout(30000);

    it("should throw Error", async () => {
        await expect(get_meta_list({})).rejects.toThrow();
    });

    it("should return meta list of GU courses", async () => {
        const meta = await get_meta_list({
            general_core: "all",
        });

        expect(meta).toHaveLength(172);
    });

    it("should return meta list of courses taught by Mr. 蔣宗哲", async () => {
        const meta = await get_meta_list({
            teacher: "蔣宗哲",
        });

        expect(meta).toHaveLength(3);
    });

    it("should return meta list of courses provided by 資工系", async () => {
        const meta = await get_meta_list({
            department: "資工系",
        });

        expect(meta).toHaveLength(24);
    });

    it("should return meta list of courses provided by 台大碩士", async () => {
        const meta = await get_meta_list({
            department: "9MAA",
        });

        expect(meta).toHaveLength(567);
    });
});
