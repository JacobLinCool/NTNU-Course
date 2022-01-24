import crypto from "crypto";

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(fn: () => T | Promise<T>, max = 3, cooldown = 0): Promise<T> {
    let err = null;
    for (let i = 0; i <= max; i++) {
        try {
            return await fn();
        } catch (e) {
            err = e;
        }
        await sleep(cooldown);
    }
    throw err;
}

export function obj_to_hash(obj: unknown): string {
    return crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");
}
