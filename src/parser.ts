/*
TODO tasks
1. loop all files and get check for credence content then save the list of files  ✅
2. parse each files and keep the extracted content to the data variable   ✅
3. generate html   ✅
4.  identifier inputs   ✅
6. extra config from package.json   ✅
5. build the cli
*/
import { cp, open, opendir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { isBinaryFile } from "isbinaryfile";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

type configType = {
  input_directory: string;
  output_directory: string;
  base_html_file: string;
  root_element_ID: string;
  assets_to_copy: string;
};

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});
function extractCredenceData(text: string) {
  const regex = /\/\*@credence-\[([^\]]*)\]-\[([^\]]*)\]\s*([\s\S]*?)\*\//g;

  const matches = [...text.matchAll(regex)];
  const array: { path: string; title: string; content: string }[] = [];
  matches.forEach((match) => {
    const path = match[1].trim();
    const title = match[2].trim();
    const content = match[3].trim();
    array.push({
      path,
      title,
      content,
    });
  });
  return array;
}
function extractCredenceDataMD(text: string) {
  const regex = /<!--\s*@credence-\[([^\]]+)\]-\[([^\]]*)\]\s*-->\s*([\s\S]*)/;
  const match = text.match(regex);
  if (!match) return {};

  const path = match[1].trim();
  const title = match[2].trim();
  const content = match[3].trim();
  return ({
    path,
    title,
    content,
  });
}

async function containsSyntax(file: string): Promise<boolean> {
  try {
    const text = await readFile(file, { encoding: "utf8" });
    const bytes = await readFile(file);
    const { size } = await stat(file);
    const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
    if (ext === ".html") return false;
    const isMarkdown = ext === ".md" || ext === ".markdown" || ext === ".mkd";
    const binary = await isBinaryFile(bytes, size);
    if (isMarkdown && !binary && text.includes("@credence")) {
      return true;
    }
    return !binary && text.includes("@credence-[");
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    return false;
  }
}

export async function getTextFiles(source: string): Promise<string[]> {
  const output: string[] = [];
  source = source ? path.resolve(cwd(), source) : cwd();

  try {
    const dir = await opendir(source);

    for await (const dirent of dir) {
      const filename = path.resolve(source, dirent.name);
      if (dirent.isFile()) {
        const hasSyntax = await containsSyntax(filename);

        if (hasSyntax) {
          output.push(filename);
        }
      } else if (
        dirent.isDirectory() && !["node_modules", ".git"].includes(dirent.name)
      ) {
        const nestedFiles = await getTextFiles(filename);
        output.push(...nestedFiles);
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${source}`, error);
  }

  return output;
}
export async function getTextFile(source: string): Promise<string[]> {
  const output: string[] = [];
  const dirent = path.resolve(cwd(), source);
  try {
    const filename = path.resolve(source, dirent);
    const hasSyntax = await containsSyntax(filename);
    if (hasSyntax) {
      output.push(filename);
    }
  } catch (error) {
    console.error(`Error reading file: ${source}`, error);
  }
  return output;
}

async function parseFiles(files: string[]) {
  const data: Record<string, { path: string; title: string; html: string[] }> =
    {};

  for (const file of files) {
    try {
      // Read the file content
      const content = await readFile(file, "utf-8");
      // Determine the file extension
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".markdown" || ext === ".mkd") {
        const match = extractCredenceDataMD(content);

        if (match.path) {
          if (!data[match.path]) {
            data[match.path] = { html: [], path: "", title: "" };
          }
          const html = md.render(match.content);
          data[match.path].path = match.path;
          if (!data[match.path].title) {
            data[match.path].title = match.title;
          }
          data[match.path].html.push(html);
        }
      } else {
        const matches = extractCredenceData(content);
        // console.log(matches);
        for (const match of matches) {
          if (match.path) {
            if (!data[match.path]) {
              data[match.path] = { html: [], path: "", title: "" };
            }
            const html = md.render(match.content);
            data[match.path].path = match.path;
            if (!data[match.path].title) {
              data[match.path].title = match.title;
            }
            data[match.path].html.push(html);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return data;
}

const getList = async (config: configType, file?: string) => {
  if (file && !file.includes(config.input_directory)) {
    return await getTextFile(file);
  }
  return getTextFiles(config.input_directory || cwd());
};
export const parseCredenceFIles = async (config: configType, file?: string) => {
  const files = await getList(config, file);
  if (files.length === 0) return;
  const data = await parseFiles(files);

  let base_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{credence}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
</head>
<body>
    <div>{credence}</div>
</body>
</html>`;
  try {
    if (config.base_html_file) {
      base_html = await readFile(config.base_html_file, { encoding: "utf-8" });
    }
  } catch (error) {
    console.error("failed to load base_html_file, ");
  }
  if (config.assets_to_copy && await open(config.assets_to_copy)) {
    const sourceDir = path.join(cwd(), config.assets_to_copy);
    const destinationDir = path.join(cwd(), config.output_directory);
    await cp(sourceDir, destinationDir, {
      recursive: true,
      force: true,
      preserveTimestamps: true,
    });
  }
  for (const file in data) {
    const outputPath = path.join(cwd(), config.output_directory, file);
    await writeFile(
      outputPath,
      base_html
        .replace(
          "<title>{credence}</title>",
          `<title>${data[file].title}</title>`,
        )
        .replace("<div>{credence}</div>", data[file].html.join(" ")),
    );
  }
  return files;
};
