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
import path, { resolve, relative } from "node:path";
//
import { compileFileWithMetadata } from "./compiler.ts";
import type { PageMetadata, PageTreeNode } from "./compiler.ts";

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
async function parseFiles(
  files: string[],
  config: configType
): Promise<PageMetadata[]> {
  const metadata: PageMetadata[] = [];

  await Promise.all(
    files.map(async (file) => {
      const { content, tags } = await compileFileWithMetadata(file);
      const outputPath = resolve(
        cwd(),
        file.replace(config["docs-directory"], config["build-directory"])
      ).replace(".md", ".html");

      ensureFileSync(outputPath);
      await writeFile(normalizePath(outputPath), content);

      // Generate relative link from build directory
      const link =
        "/" +
        relative(config["build-directory"], outputPath).replace(/\\/g, "/");

      metadata.push({
        sourcePath: relative(cwd(), file),
        outputPath: relative(cwd(), outputPath),
        link,
        docmachTags: tags,
      });
    })
  );

  return metadata;
}

function buildPageTree(
  metadata: PageMetadata[],
  config: configType
): PageTreeNode {
  const root: PageTreeNode = {
    name: "/",
    type: "directory",
    path: "/",
    children: [],
  };

  // Build tree structure
  metadata.forEach((page) => {
    // Get path relative to docs-directory
    const relPath = relative(config["docs-directory"], page.sourcePath);
    const pathParts = relPath.split(path.sep).filter(Boolean);

    let currentNode = root;

    // Navigate/create directory structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirName = pathParts[i];
      let childDir = currentNode.children?.find(
        (child) => child.name === dirName && child.type === "directory"
      );

      if (!childDir) {
        const dirPath = "/" + pathParts.slice(0, i + 1).join("/");
        childDir = {
          name: dirName,
          type: "directory",
          path: dirPath,
          children: [],
        };
        currentNode.children!.push(childDir);
      }

      currentNode = childDir;
    }

    // Add file node
    const fileName = pathParts[pathParts.length - 1].replace(".md", ".html");
    const fileNode: PageTreeNode = {
      name: fileName,
      type: "file",
      path: page.link,
      link: page.link,
      sourcePath: relative(cwd(), page.sourcePath),
      outputPath: relative(cwd(), page.outputPath),
      docmachTags: page.docmachTags,
    };

    currentNode.children!.push(fileNode);
  });

  // Sort children: directories first, then files, both alphabetically
  function sortChildren(node: PageTreeNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      node.children.forEach(sortChildren);
    }
  }

  sortChildren(root);
  return root;
}

async function generateManifest(
  metadata: PageMetadata[],
  config: configType
): Promise<void> {
  const manifestPath = join(config["build-directory"], "docmach-manifest.json");

  // Build tree structure
  const tree = buildPageTree(metadata, config);

  const manifest = {
    generatedAt: new Date().toISOString(),
    docsDirectory: relative(cwd(), config["docs-directory"]),
    buildDirectory: relative(cwd(), config["build-directory"]),
    totalPages: metadata.length,
    tree,
    // Keep flat list for backward compatibility
    pages: metadata,
  };

  await writeFile(
    normalizePath(manifestPath),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`Generated manifest: ${relative(cwd(), manifestPath)}`);
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
        file.startsWith(normalizePath(config["assets-folder"]))
      ) {
        try {
          const handle = await open(normalizePath(file));
          await handle.close();
          const sourceDir = path.relative(
            cwd(),
            normalizePath(config["assets-folder"])
          );
          const destinationDir = path.relative(
            cwd(),
            normalizePath(config["build-directory"])
          );
          await copyChangedFiles(sourceDir, destinationDir);
        } catch (_e) {
          // File doesn't exist or can't be opened
        }
      }
    }
    return;
  }
  if (config["assets-folder"]) {
    try {
      const handle = await open(normalizePath(config["assets-folder"]));
      await handle.close();
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
    } catch (_e) {
      // Assets folder doesn't exist
    }
  }
  const metadata = await parseFiles(files, config);

  // Generate manifest only during full builds (not incremental file updates)
  if (!file) {
    await generateManifest(metadata, config);
  }

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
