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

/*@credence-[/home.html]-[]
# how to build credence from source

### first clone the repo
  ```shell
  git clone credence
  ```
  ### running build command
  ```shell
  npm run build
  ```

  ## example code

  ```js
const name  = "credence is a nice doc tool"
  ```
*/
