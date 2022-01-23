import type { RawCourseMeta, MetaQueryParam, CourseMeta, CourseTime, CourseLocation } from "./types";
import fetch from "node-fetch";
import { GeneralCoreType, DepartmentCode } from "./types";
import { YEAR, TERM } from "./constants";

export async function get_meta_list(raw_query: MetaQueryParam): Promise<CourseMeta[]> {
    const query: Required<MetaQueryParam> = Object.assign(
        {
            year: YEAR,
            term: TERM,
            name: "",
            teacher: "",
            department: "",
            class: "",
            code: "",
            serial: "",
            english: "N",
            digital: "N",
            adsl: "N",
            general_core: "",
        } as Required<MetaQueryParam>,
        raw_query,
    );

    const target = `https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/CofopdlCtrl?${[
        "_dc=" + Date.now(),
        "acadmYear=" + query.year,
        "acadmTerm=" + query.term,
        "chn=" + query.name,
        "engTeach=" + query.english,
        "moocs=N",
        "remoteCourse=N",
        "digital=" + query.digital,
        "adsl=" + query.adsl,
        "deptCode=" + (query.department ? DepartmentCode[query.department] : query.general_core ? "GU" : ""),
        "zuDept=",
        "classCode=" + query.class,
        "kind=" + (query.general_core ? "3" : ""),
        "generalCore=" + GeneralCoreType[query.general_core],
        "teacher=" + encodeURIComponent(encodeURIComponent(query.teacher)),
        "serial_number=" + query.serial,
        "course_code=" + query.code,
        "language=chinese",
        "action=showGrid",
        "start=0",
        "limit=99999",
        "page=1",
    ].join("&")}`;

    const res = await fetch(target, {
        headers: {
            Accept: "*/*",
            "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Referer: "https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/CofopdlCtrl?language=chinese",
            "User-Agent": "NTNU-Course",
        },
    });

    if (res.headers.get("content-length") === "0") {
        throw new Error("No Data. Maybe the query is wrong.");
    }

    return res.json().then((json: { Count: number; List: RawCourseMeta[] }) => {
        const meta: CourseMeta[] = [];

        for (const raw of json.List) {
            const course: CourseMeta = {
                year: parseInt(raw.acadm_year),
                term: parseInt(raw.acadm_term),
                name: raw.chn_name.split("</br>")[0].trim(),
                teachers: raw.teacher
                    .split(" ")
                    .map((x) => x.trim())
                    .filter((x) => x.length),
                department: raw.dept_code.trim(),
                code: raw.course_code.trim(),
                credit: parseInt(raw.credit),
                serial: parseInt(raw.serial_no),
                group: raw.course_group.trim(),
                quota: {
                    limit: parseInt(raw.limit_count_h),
                    additional: parseInt(raw.authorize_p),
                },
                schedule: parse_schedule(raw.time_inf),
                programs: parse_programs((raw.chn_name.split("</br>")[1] || "").trim()),
                form_s: raw.form_s.trim(),
                classes: raw.classes.trim(),
                dept_group: raw.dept_group.trim(),
            };

            meta.push(course);
        }

        return meta;
    });
}

function parse_schedule(raw: string): (CourseTime & CourseLocation)[] {
    const time_locations = raw.split(",").map((x) => x.trim());

    const time_regex = /^([一二三四五六日]) ([\dA-D]0?)(?:-([\dA-D]0?))*/;

    const schedule: (CourseTime & CourseLocation)[] = [];

    for (const time_location of time_locations) {
        if (time_location === "◎密集課程") {
            schedule.push({ day: -1, from: 0, to: 0, campus: "", classroom: "" });
            continue;
        }

        const time_match = time_location.match(time_regex);
        const location_match = time_location
            .replace(time_regex, "")
            .split(" ")
            .map((x) => x.trim())
            .filter((x) => x.length);

        const day = time_match ? [..."一二三四五六日"].findIndex((x) => x === time_match[1]) + 1 : 0;
        const from = time_match ? parseInt(time_match[2], 16) : -1;
        const to = time_match
            ? time_match[3]
                ? transform_course_time_code(time_match[3])
                : transform_course_time_code(time_match[2])
            : -1;
        const campus = location_match.length === 2 ? location_match[0].trim() : "";
        const classroom = location_match.length === 2 ? location_match[1].trim() : location_match.join(" ");

        schedule.push({ day, from, to, campus, classroom });
    }

    return schedule;
}

function parse_programs(raw: string): string[] {
    const content = raw.match(/\[ ?學分學程：([^\]]+) ?]/);
    return content
        ? content[1]
              .split(" ")
              .map((p) => p.trim())
              .filter((x) => x.length)
        : [];
}

function transform_course_time_code(code: string): number {
    if (code.match(/^[A-D]$/)) {
        return parseInt(code, 16);
    }
    return parseInt(code);
}
