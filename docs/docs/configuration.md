<docmach type="fragment" file="fragments/head.html" params="title: Docmach Quickstart" />
<docmach type="fragment" file="fragments/doc-sidebar.html"   />

## Quickstart

# Docmach Configuration
#### Docmach configuration is done in the `package.json` file. The configuration is done under the `docmach` key.

#### Configuration Options
  ```json
  // package.json  add these config
  ...
  "docmach": {
    "docs-directory": "docs",
    "build-directory": "docmach",
    "assets-folder": "assets"
  }
  ```

****docs-directory**** | The directory where the markdown files are located.
 Default is the root directory.

****build-directory**** | The directory where the generated static site will be placed. Default is ****docs****.

****assets-folder**** | The path to the directory containing assets that should be copied to the output directory. Default is ****./local****.


<docmach type="fragment" file="fragments/doc-sidebar-end.html"   />
<docmach type="fragment" file="fragments/footer.html" />
