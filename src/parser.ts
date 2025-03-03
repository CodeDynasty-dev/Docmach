/*
TODO tasks
1. loop all files and get check for credence content then save the list of files  ✅
2. parse each files and keep the extracted content to the data variable   ✅
3. generate html   ✅
4.  identifier inputs   ✅
6. extra config from package.json   ✅
5. build the cli   ✅
6. optimization
7. test
8. publish
9. documentation
10 add plugin system
11. add more templates
12. add more options   
*/
import { cp, open, opendir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

type configType = {
  "docs-directory": string;
  "build-directory": string;
  "default-template": string; 
  "assets-folder": string;
  "root": string;
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
interface CredenceComment {
  path: string;
  content: string;
  title?: string;
  template?: string;
}
function extractCredenceData(text: string) { 
  const regex = /\/\*\s*@credence-\[([^\]]+)\](?:-\[([^\]]+)\])?(?:-\[([^\]]+)\])?\s*([\s\S]*?)\*\//g;
  const comments: CredenceComment[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) { 
    const [_, path, title, templateFile, markdownContent] = match;
    comments.push({
      path,
      title: title || '',
      template: templateFile || '',
      content: markdownContent.trim()
    });
  } 
  return comments;
}

 
function extractCredenceDataMD(text: string) {
  const regex =  /<!--\s*@credence-\[([^\]]+)\](?:-\[([^\]]+)\])?(?:-\[([^\]]+)\])?\s*-->\n?([\s\S]*)/;
  const match = text.match(regex);
  if (!match) return {}; 
  const [_, path, title, templateFile, markdownContent] = match;
   return ({
      path,
      title: title || "",
      template: templateFile||"",
      content: markdownContent.trim()
    });  
}

const allowedFiles =/(.js|.ts|.md|.mdk|.markdown)/
async function containsSyntax(file: string): Promise<boolean> {
  if (!allowedFiles.test(file)) 
    return false;
    try {
    const text = await readFile(file, { encoding: "utf8" }); 
    return text.includes("@credence-[");
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    return false;
  }
}

export async function getTextFiles(source: string, config: configType): Promise<string[]> {
  const output: string[] = [];
  try {
  source = source ? path.resolve(cwd(), source) : cwd();
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
        const nestedFiles = await getTextFiles(filename, config);
        output.push(...nestedFiles);
      }
    }
  } catch {
    console.error(`Error reading directory: ${source.slice(0, 50)}...`);
    if (config["docs-directory"] === config["root"]) {
      console.warn(
        "Please specify credence `docs-directory` key is set in your `package.json` file.",
      );
      
    }
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
  const data: Record<string, { path: string; title: string; html: string[]; template?: string }> =
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
            data[match.path] = { html: [], path: "", title: "", template:"" };
          }
          const html = md.render(match.content);
          data[match.path].path = match.path;
          data[match.path].template = match.template;
          if (!data[match.path].title) {
            data[match.path].title = match.title;
          }
          data[match.path].html.push(html);
        }
      } else {
        const matches = extractCredenceData(content); 
        for (const match of matches) {
          if (match.path) {
            if (!data[match.path]) {
              data[match.path] = { html: [], path: "", title: "",template:"" };
            }
            const html = md.render(match.content);
            data[match.path].path = match.path;
            data[match.path].template = match.template;
            if (!data[match.path].title && match.title) {
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
  if (file && !file.includes(config["docs-directory"])) {
    return await getTextFile(file);
  }
  return getTextFiles(config["docs-directory"] || cwd(), config);
};

function ensureFileSync(filePath: string) {
  const dir = path.dirname(filePath);
  if (! existsSync(dir)) {
     mkdirSync(dir, { recursive: true });
  }
     writeFileSync(filePath, ''); 
}

export const parseCredenceFIles = async (config: configType, file?: string) => {
  const files = await getList(config, file);
  if (files.length === 0) return;  
  
  const data = await parseFiles(files);
  let base_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> <%= title %></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
</head>
<body>
    <div> <%= content %></div>
</body>
</html>`;
if (config["assets-folder"] && await open(config["assets-folder"])) {
  const sourceDir = path.join(cwd(), config["assets-folder"]);
  const destinationDir = path.join(cwd(), config["build-directory"]);
  await cp(sourceDir, destinationDir, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });
}
for (const file in data) {
  const outputPath = path.join(cwd(), config["build-directory"], file);
  const template = data[file].template || config["default-template"];
  try {
      if (template) {
        base_html = await readFile( template , { encoding: "utf-8" });
      }
    ensureFileSync(outputPath);
      await writeFile(  
        outputPath,
        base_html
        .replace(
          "<%= title %>",
          `${data[file].title}`,
        )
        .replace("<%= content %>", data[file].html.join(" ")),
      );
  } catch (error) {
    console.log(error);
    
      console.error("failed to load template " + template+".");
    }
  }
  return files;
};
