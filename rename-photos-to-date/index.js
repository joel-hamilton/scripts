/**
 * Recursively renames .CR2 files to use the date taken, as extracted from EXIF data
 */

const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const exiftool = require("exiftool-vendored").exiftool;
const glob = promisify(require("glob"));
const rename = promisify(fs.rename);
const readline = require("readline");
const { zip } = require("lodash");

const dirPath = path.resolve(process.argv[2]);
const dryRun = process.argv[3] === "--dry-run";

(async () => {
  const filePaths = await glob(`${dirPath}/**/*.CR2`);
  const newPathsPromises = filePaths.map(getDateFileName);
  const newOldPaths = zip(filePaths, await Promise.all(newPathsPromises));
  const filteredNewOldPaths = newOldPaths.filter((nop) => !!nop[1]);

  const doRename = await prompt(
    `${dryRun ? "Mock r" : "R"}ename ${filteredNewOldPaths.length} files? [y/N]`
  );
  if (doRename.toLowerCase() !== "y") {
    process.exit();
  }

  const renamePromises = filteredNewOldPaths.map(renameOldNewPaths);
  await Promise.all(renamePromises);

  process.exit();
})();

const prompt = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

const getDateFileName = async (filePath) => {
  const dirName = path.dirname(filePath);
  const fileExtension = path.extname(filePath);
  const date = (await exiftool.read(filePath)).DateTimeOriginal;

  if (!date) {
    console.log(`Not renaming ${filePath}. No date found in exif data`);
    return null;
  }

  const dateString = `${[date.year, padNum(date.month), padNum(date.day)].join(
    ""
  )}_${[padNum(date.hour), padNum(date.minute), padNum(date.second)].join("")}`;

  return path.join(dirName, dateString) + `${fileExtension}`;
};

const renameOldNewPaths = async ([filePath, newFilePath]) => {
  console.log(`${filePath}\n-> ${newFilePath}\n`);

  if (!dryRun) {
    return rename(filePath, newFilePath);
  }
};

const padNum = (number) => {
  return (number + "").padStart(2, "0");
};
