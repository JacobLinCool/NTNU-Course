/* eslint-disable no-irregular-whitespace */
import type { CourseMeta, CourseInfo, CourseLecturingMethodology, CourseGradingPolicy, GeneralCoreType } from "./types";
import fetch from "node-fetch";
import cheerio, { Cheerio, Element } from "cheerio";
import Turndown from "turndown";

const turndown = new Turndown();

export async function get_info(meta: CourseMeta): Promise<CourseInfo> {
    const target = `https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/SyllabusCtrl?${[
        "year=" + meta.year,
        "term=" + meta.term,
        "courseCode=" + meta.code,
        "courseGroup=" + meta.group,
        "deptCode=" + meta.department,
        "formS=" + meta.form_s,
        "classes1=" + meta.classes,
        "deptGroup=" + meta.dept_group,
    ].join("&")}`;

    const html = await fetch(target).then((res) => res.text());
    if (html.includes("無此課程！")) {
        throw new Error(`${meta.department}-${meta.code}-${meta.group} Not found. (${target})`);
    }
    const $ = cheerio.load(html);

    const anchors = $("[bgcolor='#DFEFFF']")
        .toArray()
        .reduce((acc, elm) => {
            const $elm = $(elm);
            const text = $elm.text().trim();

            return { ...acc, [text]: elm };
        }, {}) as { [key: string]: Element };

    const hours = get_hours($(anchors["每週授課時數"]).next());
    const description = $(anchors["課程簡介"]).next().text().trim();
    const goals = get_goals($(anchors["課程目標"]).parent());
    const syllabus = get_syllabus($(anchors["教學進度與主題"]).parent().next().children().first());
    const methodologies = get_methodologies($(anchors["教學方法"]).parent());
    const grading = get_grading($(anchors["評量方法"]).parent());
    const prerequisite = anchors["先修課程"] ? $(anchors["先修課程"]).next().text().trim() : "";
    const general_core = anchors["領域類別"] ? get_general_core($(anchors["領域類別"]).next()) : [];

    return { ...meta, hours, description, goals, syllabus, methodologies, grading, prerequisite, general_core };
}

function get_hours(elm: Cheerio<Element>): number {
    return elm
        .text()
        .replace(/[^0-9]/g, " ")
        .split(" ")
        .map(parseInt)
        .filter(Boolean)
        .reduce((acc, cur) => acc + cur, 0);
}

function get_goals(elm: Cheerio<Element>): string[] {
    const goals: string[] = [];
    while (elm.next().length) {
        const text = elm
            .next()
            .children()
            .first()
            .text()
            .trim()
            .replace(/^\d\.　/, "");
        goals.push(text);
        elm = elm.next();
    }
    return goals;
}

function get_syllabus(elm: Cheerio<Element>): string {
    return turndown.turndown((elm.html() || "").trim());
}

function get_methodologies(elm: Cheerio<Element>): CourseLecturingMethodology[] {
    const methodologies: CourseLecturingMethodology[] = [];
    let current = elm.next().next();
    while (current.text().trim() !== "評量方法") {
        const children = current.children();
        const type = children.first().text().trim();
        const note = children.last().text().trim();

        methodologies.push({ type, note });

        current = current.next();
    }
    return methodologies;
}

function get_grading(elm: Cheerio<Element>): CourseGradingPolicy[] {
    const grading: CourseGradingPolicy[] = [];
    let current = elm.next().next();
    while (!current.text().includes("參考書目")) {
        const children = current.children();
        const type = children.first().text().trim();
        const weight = parseInt(
            children
                .first()
                .next()
                .text()
                .replace(/[^0-9.]/g, ""),
        );
        const note = children.last().text().trim();

        grading.push({ type, weight, note });

        current = current.next();
    }
    return grading;
}

function get_general_core(elm: Cheerio<Element>): GeneralCoreType[] {
    const general_core: GeneralCoreType[] = [];
    const texts = elm.text().split("；");
    texts.forEach((text) => {
        const [type, core] = text.split("：").map((x) => x.trim());
        if (type === "109起入學" && core !== "null") {
            general_core.push(core as GeneralCoreType);
        }
    });
    return general_core;
}
