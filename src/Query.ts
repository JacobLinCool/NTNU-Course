import type { CourseMeta, MetaQueryParam } from "./types";
import { get_meta_list, normalize_meta_query } from "./meta";
import { obj_to_hash, retry } from "./utils";

/**
 * 查詢主體
 */
export class Query {
    /**
     * 內部快取
     */
    private _cache = {
        meta: new Map<string, CourseMeta[]>(),
        info: new Map<string, any>(),
    };

    /**
     * 是否使用快取
     */
    public cache = true;

    /**
     * 最大失敗自動重試次數
     */
    public retry = 1;

    /**
     * 自動重試冷卻時間 (毫秒)
     */
    public cooldown = 1000;

    /**
     * 依條件查詢課程 Metadata
     * @param raw_query 課程 Metadata 查詢參數
     * @returns 課程 Metadata
     */
    public async meta(raw_query: MetaQueryParam): Promise<CourseMeta[]> {
        const query = normalize_meta_query(raw_query);
        const hash = obj_to_hash(query);

        if (this.cache && this._cache.meta.has(hash)) {
            return this._cache.meta.get(hash) as CourseMeta[];
        }

        const meta = await retry(() => get_meta_list(query), this.retry, this.cooldown);
        this._cache.meta.set(hash, meta);
        return meta;
    }

    /**
     * 清空快取
     */
    public clear(): void {
        this._cache.meta.clear();
        this._cache.info.clear();
    }
}
