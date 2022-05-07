const { execSync } = require("child_process");

execSync("ts-json-schema-generator --no-type-check -p src/types/result_types.ts -o schema/defs.json");
