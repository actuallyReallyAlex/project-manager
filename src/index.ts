#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// import { authenticate } from "./auth";
// 
// TODO - Abstract all this GitHub Oauth stuff into it's own package

const main = async () => {
  try {
    // const existingAuth = await authenticate();
    const argv = yargs(hideBin(process.argv)).command("create", "Create a _____").example("project-manager --create=repo", "Create a new repository.")
      .usage("Usage: project-manager --COMMAND=OPTION").argv;

    if (argv.create && argv.create === "repo") {
      console.log("Hello, World!");
    }
  } catch (error) {
    throw new Error(error);
  }
};

main();
