// @ts-expect-error
const res = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "./dist",
  // outdir: "./tests/dist",
  target: "node",
  format: "esm",
  // minify: true,
});
if (!res.success) {
  console.log(...res.logs);
} else {
  Bun.spawn(["./pack"]);
}

/*@credence-[/configuration.html]-[]

### Credence is a documentation tool that allows you to write markdown documentation in your codebase and generate a static site from it.

# Credence Configuration

### Credence configuration is done in the `package.json` file. The configuration is done under the `credence` key.

#### Configuration Options
  ```json
  // package.json
  ...
  "credence": {
    "input_directory": ".",
    "output_directory": "docs",
    "base_html_file": "local/index.html",
    "assets_to_copy": "./local"
  },
  ...
  ```   
*/
/*@credence-[/configuration.html]-[]
### Options Descriptions
---

`input_directory` | The directory where the markdown files are located.
 Default is the root directory.


`output_directory` | The directory where the generated static site will be placed. Default is `docs`.


`base_html_file` | The path to the base html file that will be used to generate the static site. Default is `local/index.html`.


`assets_to_copy` | The path to the directory containing assets that should be copied to the output directory. Default is `./local`.


*/
