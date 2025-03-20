<docmach type="fragment" file="fragments/head.html" params="title: Docmach Quickstart" />
<docmach type="fragment" file="fragments/doc-sidebar.html"   />

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

<docmach type="fragment" file="fragments/doc-sidebar-end.html"   />
<docmach type="fragment" file="fragments/footer.html" />
