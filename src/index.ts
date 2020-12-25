#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { request } from "@octokit/request";

import { authenticate } from "./auth";
// TODO - Abstract all this GitHub Oauth stuff into it's own package

const main = async () => {
  try {
    const existingAuth = await authenticate();

    if (!existingAuth) {
      console.log(existingAuth);
      throw new Error("Problem with authentication!");
    }
    const argv = yargs(hideBin(process.argv))
      .command("create-repo --name <name>", "Create a new repo").options({ })
      .example("project-manager --create-repo --name my-new-repo", "Create a new repository named 'my-new-repo'.")
      .usage("Usage: project-manager --<command>=<option>")
      .demandCommand()
      .argv;

    if (argv.create && argv.create === "repo") {
      console.log(`Creaating a new repository -- ${argv.name}`);

      const result = await request({
        data: {
          name: argv.name
        },
        headers: {
          authorization: `token ${existingAuth.accessToken}`,
        },
        method: "POST",
        url: "/user/repos",
      });

      if (result.status === 201) {
        console.log(`Created ${result.data.name}`);
      } else {
        console.error(result);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

export default main;
