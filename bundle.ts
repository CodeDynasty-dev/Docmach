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

/*@credence-[/docs.html]-[]

# Credence Configuration
#### Credence configuration is done in the `package.json` file. The configuration is done under the `credence` key.

#### Configuration Options
  ```json
  // package.json
  ...
  "credence": {
    "docs-directory": ".",
    "build-directory": "docs",
    "default-template": "local/index.html",
    "assets-folder": "./local"
  },
  ...
  ```   
*/

/*@credence-[/docs.html]-[]
### Options Descriptions
---

`docs-directory` | The directory where the markdown files are located.
 Default is the root directory.


`build-directory` | The directory where the generated static site will be placed. Default is `docs`.


`default-template` | The path to the base html file that will be used to generate the static site. Default is `local/index.html`.


`assets-folder` | The path to the directory containing assets that should be copied to the output directory. Default is `./local`.


*/
