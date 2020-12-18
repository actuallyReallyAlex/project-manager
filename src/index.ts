import fetch from "node-fetch";
import fse from "fs-extra";
import path from "path";

import { authenticateUser } from "./auth";

import { AuthenticationCredentials } from "./types";
import { isError } from "./util";

// TODO - Abstract all this GitHub Oauth stuff into it's own package

const authPath = path.join(__dirname, "../auth.json");

const main = async () => {
  try {
    const existingAuthExists = await fse.pathExists(authPath);
    let existingAuth: AuthenticationCredentials | null = null;

    if (!existingAuthExists) {
      const authenticationResult = await authenticateUser();

      if (isError(authenticationResult)) {
        throw new Error("Authentication Error!");
      }

      existingAuth = authenticationResult;

      await fse.writeJSON(authPath, existingAuth, { spaces: 2 });
    } else {
      console.log("Existing authentication found.");
      existingAuth = await fse.readJSON(authPath);
    }

    const apiBase = "https://api.github.com";

    const listReposUrl = `${apiBase}/user/repos?affiliation=owner&per_page=100`;

    fetch(listReposUrl, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `token ${existingAuth?.accessToken}`
      }
    }).then((res) => res.json()).then((value) => {
      console.log(`Found ${value.length} owned repositories.`);
    }).catch((error) => {
      console.error(error);
    });
  } catch (error) {
    throw new Error(error);
  }
};

main();
