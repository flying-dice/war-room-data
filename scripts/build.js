const { flow, transform, camelCase, map } = require("lodash");
const csv = require("csv/lib/sync");
const { parse, resolve } = require("path");
const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { ensureDirSync } = require("fs-extra");
const { stringify } = require("javascript-stringify");

const SRC = resolve(__dirname, "../data");
const DEST = resolve(__dirname, "../dist");

ensureDirSync(DEST);

const readFile = (fileName) => readFileSync(resolve(SRC, fileName)).toString();

const parseCsv = (csvString) =>
  csv.parse(csvString, {
    columns: true,
    skip_empty_lines: true,
  });

const mapRow = (arr) =>
  map(arr, (it) => transform(it, (r, v, k) => (r[camelCase(k)] = v)));

const prettyPrint = (obj) => `module.exports = ${stringify(obj, null, 2)}`;

const convertCsvToJs = (file) => {
  const destFile = resolve(DEST, `${camelCase(parse(file).name)}.js`);
  writeFileSync(
    destFile,
    flow([readFile, parseCsv, mapRow, prettyPrint])(file)
  );
};

const files = readdirSync(SRC).filter((it) => parse(it).ext === ".csv");

files.forEach(convertCsvToJs);

const jsFiles = readdirSync(DEST);
writeFileSync(
  resolve(DEST, `index.js`),
  jsFiles
    .map((it) => {
      const key = it.replace(".js", "");
      return `export const ${key} = require("./${key}");`;
    })
    .join("\n")
);
