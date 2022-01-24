import type { YesNo, GeneralCoreType, DepartmentCode } from "./common_types";

/**
 * 課程 Metadata 查詢參數
 */
export interface MetaQueryParam {
    /**
     * 學年度
     */
    year?: string | number;

    /**
     * 學期
     */
    term?: string | number;

    /**
     * 課程名稱
     */
    name?: string;

    /**
     * 教師姓名
     */
    teacher?: string;

    /**
     * 開課系所
     */
    department?: keyof typeof DepartmentCode;

    /**
     * 開課班級
     */
    class?: string;

    /**
     * 科目代碼
     */
    code?: string;

    /**
     * 開課序號
     */
    serial?: string | number;

    /**
     * 英語授課
     */
    english?: YesNo;

    /**
     * 數位課程
     */
    digital?: YesNo;

    /**
     * 進階服務學習
     */
    adsl?: YesNo;

    /**
     * 通識領域
     */
    general_core?: keyof typeof GeneralCoreType;
}
