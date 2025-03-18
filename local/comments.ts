/*@docmach-[/docs/configuration.html]

# Docmach Configuration
#### Docmach configuration is done in the `package.json` file. The configuration is done under the `docmach` key.

#### Configuration Options
  ```json
  // package.json
  ...
  "docmach": {
    "docs-directory": ".",
    "build-directory": "docs",
    "default-template": "local/index.html",
    "assets-folder": "./local"
  },
  ...
  ```
*/

/*@docmach-[/docs/configuration.html]-[Docmach Configuration]
### Options Descriptions
---

`docs-directory` | The directory where the markdown files are located.
 Default is the root directory.


`build-directory` | The directory where the generated static site will be placed. Default is `docs`.


`default-template` | The path to the base html file that will be used to generate the static site. Default is `local/index.html`.


`assets-folder` | The path to the directory containing assets that should be copied to the output directory. Default is `./local`.


*/
/*@docmach-[/examples.html]-[Docmach Examples]-[local/blog.html]
## Examples
#### Send a pr to add your examples to the list.
---

**1. [Docmach docs](https://github.com/CodeDynasty-dev/Docmach/tree/main/docs)**

*/

/*@docmach-[/docs/quickstart.html]-[Docmach Quickstart]
## Quickstart
#### Get started with Docmach in a few simple steps.
---

1. **Install Docmach**
   ```bash
   npm install -g docmach
   ```
2. **Create a new directory**
   ```bash
   mkdir my-docs
   cd my-docs
   ```
3. **Start the development server**
   ```bash
   docmach
   ```
5. **Open your browser and navigate to `http://localhost:4000`**


<div class="container mx-auto px-6 py-8 max-w-4xl border-t border-white/10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Previous Post -->
        <a href="#" class="group relative overflow-hidden rounded-xl bg-white/5 p-6 transition-all hover:bg-white/10">
            <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Previous</p>
                    <h3 class="text-lg font-medium text-white group-hover:text-orange-400 transition-colors">Getting Started with Docmach</h3>
                </div>
            </div>
        </a>
        <a href="#" class="group relative overflow-hidden rounded-xl bg-white/5 p-6 transition-all hover:bg-white/10">
            <div class="flex items-center gap-4 justify-end">
                <div>
                    <p class="text-sm text-gray-400 text-right">Next</p>
                    <h3 class="text-lg font-medium text-white group-hover:text-orange-400 transition-colors">Advanced Configuration</h3>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </a>
    </div>
</div>
*/
