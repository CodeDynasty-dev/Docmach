#!/usr/bin/env node

import {statSync, readdirSync} from "node:fs";
import {join} from "node:path";

// Exclude these directories
const excludedDirs = [".git", "node_modules"];

// Function to check if a directory contains `.html` files or subdirectories with `.html` files
function containsHtmlFiles(dir: string): boolean {
  const items =  readdirSync(dir);

  for (let item of items) {
    const fullPath =  join(dir, item);
    const isDirectory =  statSync(fullPath).isDirectory();

    if (isDirectory) {
      if (excludedDirs.includes(item)) continue; // Skip excluded directories
      if (containsHtmlFiles(fullPath)) return true; // Recursively check subdirectories
    } else if (item.endsWith(".html")) {
      return true; // Found an `.html` file
    }
  }
  return false; // No `.html` files or valid subdirectories found
}

// Function to print the folder structure with directories first
function printFolderStructure(dir: string, level = 0) {
  const indent = "  ".repeat(level); // Indentation for hierarchy
  const items =  readdirSync(dir);

  // Separate folders and files
  const directories = [];
  const files = [];
  for (let item of items) {
    const fullPath =  join(dir, item);
    const isDirectory =  statSync(fullPath).isDirectory();

    if (excludedDirs.includes(item)) continue; // Skip excluded directories
    if (isDirectory) {
      if (containsHtmlFiles(fullPath)) {
        directories.push(item); // Only include directories that have `.html` files or subdirectories containing `.html`
      }
    } else if (item.endsWith(".html")) {
      files.push(item); // Only include `.html` files
    }
  }

  // Sort directories and files alphabetically
  directories.sort();
  files.sort();

  // Print directories first
  directories.forEach((directory) => {
    console.log(`${indent}├── /${directory}/`);
    printFolderStructure( join(dir, directory), level + 1);
  });

  // Print files next
  files.forEach((file) => {
    console.log(`${indent}├── /${file}`);
  });
}

// Entry Point of CLI Tool
export function Print(targetDir = process.cwd()) {
  console.log(`\nDocmach site structure\n`);
  console.log("┬");
  printFolderStructure(targetDir);
  console.log("\nComplete!");
}
 
