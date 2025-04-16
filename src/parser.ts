/*
TODO tasks
1. loop all files and get check for docmach content then save the list of files  ✅
2. parse each files and keep the extracted content to the data variable   ✅
3. generate html   ✅
4.  identifier inputs   ✅
6. extra config from package.json   ✅
5. build the cli   ✅
6. optimization   ✅
7. test
8. publish
9. documentation
10 add plugin system
11. add more templates
12. add more options
*/
import {
  createReadStream,
  createWriteStream,
  Dirent,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import {
  mkdir,
  open,
  opendir,
  readdir,
  stat,
  utimes,
  writeFile,
} from "fs/promises";
import { pipeline } from "stream/promises";
import { cwd } from "node:process";
import { join } from "path";
import path, { resolve } from "node:path";
//
import { compileFile } from "./compiler.ts";

type configType = {
  "docs-directory": string;
  "build-directory": string;
  "assets-folder": string;
  root: string;
};

const allowedFiles = /.md/;
async function getTextFiles(
  source: string,
  config: configType
): Promise<string[]> {
  const output: string[] = [];
  try {
    source = source ? path.resolve(cwd(), source) : cwd();
    const dir = await opendir(normalizePath(source));
    for await (const dirent of dir) {
      const filename = path.resolve(source, dirent.name);
      if (dirent.isFile() && allowedFiles.test(filename)) {
        output.push(filename);
      } else if (
        dirent.isDirectory() &&
        !["node_modules", ".git"].includes(dirent.name)
      ) {
        const nestedFiles = await getTextFiles(filename, config);
        output.push(...nestedFiles);
      }
    }
  } catch {
    console.error(`Error reading directory: ${source.slice(0, 50)}...`);
    if (config["docs-directory"] === config["root"]) {
      console.warn(
        "Please specify docmach `docs-directory` key in your `package.json` file \n Currently set to'.'."
      );
    }
  }
  return output;
}

export async function getTextFile(source: string): Promise<string[]> {
  const output: string[] = [];
  const dirent = normalizePath(path.resolve((cwd(), source)));
  try {
    const filename = path.resolve(source, dirent);
    if (allowedFiles.test(dirent)) {
      output.push(filename);
    }
  } catch (error) {
    console.error(`Error reading file: ${source}`, error);
  }
  return output;
}

function ensureFileSync(filePath: string) {
  const dir = path.dirname(filePath);
  if (!existsSync(normalizePath(dir))) {
    mkdirSync(normalizePath(dir), { recursive: true });
  }
  writeFileSync(normalizePath(filePath), "");
}
async function parseFiles(files: string[], config: configType) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = await compileFile(file);
    const path = resolve(
      cwd(),
      file.replace(config["docs-directory"], config["build-directory"])
    ).replace(".md", ".html");
    ensureFileSync(path);
    await writeFile(normalizePath(path), content);
  }
}

const getList = async (config: configType, file?: string) => {
  if (
    file &&
    (!allowedFiles.test(file) || !file.includes(config["docs-directory"]))
  )
    return [];
  if (file) {
    return await getTextFile(file);
  }
  return getTextFiles(config["docs-directory"] || cwd(), config);
};

async function copyChangedFiles(
  sourceDir: string,
  destinationDir: string
): Promise<void> {
  async function processFile(srcPath: string, destPath: string): Promise<void> {
    try {
      const srcStat = await stat(normalizePath(srcPath));
      let shouldCopy = true;
      try {
        const destStat = await stat(normalizePath(destPath));
        if (srcStat.mtimeMs <= destStat.mtimeMs) {
          shouldCopy = false;
        }
      } catch (err: any) {
        if (err.code !== "ENOENT") throw err;
      }
      if (shouldCopy) {
        await pipeline(
          createReadStream(normalizePath(srcPath)),
          createWriteStream(normalizePath(destPath))
        );
        await utimes(normalizePath(destPath), srcStat.atime, srcStat.mtime);
      }
    } catch (error) {
      console.error(`Error processing file ${srcPath}:`, error);
    }
  }

  async function processDirectory(src: string, dest: string): Promise<void> {
    await mkdir(normalizePath(dest), { recursive: true });
    const entries: Dirent[] = await readdir(normalizePath(src), {
      withFileTypes: true,
    });
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        if (entry.isDirectory()) {
          return processDirectory(srcPath, destPath);
        } else {
          return processFile(srcPath, destPath);
        }
      })
    );
  }
  await processDirectory(sourceDir, destinationDir);
}

export const parseDocmachFIles = async (config: configType, file?: string) => {
  const files = await getList(config, file);
  if (files.length === 0) {
    if (file) {
      // check
      if (
        config["assets-folder"] &&
        file.startsWith(normalizePath(config["assets-folder"])) &&
        (await open(normalizePath(file)))
      ) {
        const sourceDir = path.relative(
          cwd(),
          normalizePath(config["assets-folder"])
        );
        const destinationDir = path.relative(
          cwd(),
          normalizePath(config["build-directory"])
        );
        await copyChangedFiles(sourceDir, destinationDir);
      }
    }
    return;
  }
  if (
    config["assets-folder"] &&
    (await open(normalizePath(config["assets-folder"])))
  ) {
    const sourceDir = path.relative(
      cwd(),
      normalizePath(config["assets-folder"])
    );
    const destinationDir = path.relative(
      cwd(),
      normalizePath(config["build-directory"])
    );
    await copyChangedFiles(
      normalizePath(sourceDir),
      normalizePath(destinationDir)
    );
  }
  await parseFiles(files, config);
  return files;
};

// utils/paths.ts
export function detectOS(): "windows" | "linux" | "darwin" | "unknown" {
  const platform =
    typeof process !== "undefined" ? process.platform : "unknown";
  // @ts-expect-error
  if (platform === "win32" || platform === "windows") return "windows";
  if (platform === "linux") return "linux";
  if (platform === "darwin") return "darwin";
  return "unknown";
}

export function toPOSIXPath(path: string): string {
  return path.replace(/\\/g, "/");
}

export function toWindowsPath(path: string): string {
  return path.replace(/\//g, "\\");
}

export function normalizePath(path: string): string {
  const os = detectOS();
  if (os === "windows") return toWindowsPath(path);
  return toPOSIXPath(path);
}
