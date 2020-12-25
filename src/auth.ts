import fse from "fs-extra";
import path from "path";

import { getData, isError } from "./util";

import { AuthenticationCredentials, ErrorInfo, GitHubOauthStep1Response, GitHubOauthStep3Error, GitHubOauthStep3Response } from "./types";

const authPath = path.join(__dirname, "../auth.json");

export const authenticate = async (): Promise<AuthenticationCredentials> => {
  const existingAuthExists = await fse.pathExists(authPath);
  if (!existingAuthExists) {
    const authenticationResult = await authenticateUser();

    if (isError(authenticationResult)) {
      throw new Error("Authentication Error!");
    }

    const auth = authenticationResult;

    await fse.writeJSON(authPath, auth, { spaces: 2 });
    return auth;
  } else {
    console.log("Existing authentication found.");
    const auth = await fse.readJSON(authPath);
    return auth;
  }
};

export const authenticateUser = async (): Promise<AuthenticationCredentials | ErrorInfo> => {
  try {
    console.log("Starting Authentication process with GitHub ...");

    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
      throw new Error("Required environment variables not provided!");
    }
    const requestedScope = "repo";
    const url = `https://github.com/login/device/code?client_id=${encodeURIComponent(
      clientId,
    )}&scope=${encodeURIComponent(requestedScope)}`;
    const gitHubCodes: GitHubOauthStep1Response = await getData(url, { method: "POST" });

    if (isError(gitHubCodes)) {
      console.error(gitHubCodes);
      throw new Error("Error when getting verification codes from GitHub!");
    }

    console.log(`Please visit ${gitHubCodes.verification_uri} in your browser to authenticate Project Manager with your GitHub account.`);
    console.log(`When prompted, enter the following code: ${gitHubCodes.user_code}`);
    console.log("Project Manager will wait until you are successfully authenticated to continue ...");

    const authenticationResult = await verifyAuthentication(clientId, gitHubCodes.device_code, gitHubCodes.interval);

    if (isError(authenticationResult)) {
      return { error: "Error when authenticating!" };
    }

    return authenticationResult;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const verifyAuthentication = (clientId: string, deviceCode: string, interval: string): Promise<AuthenticationCredentials | ErrorInfo> => new Promise((resolve, reject) => {
  try {
    const cleanedDeviceCode = deviceCode.replace("-", "");

    const authUrl = `https://github.com/login/oauth/access_token?client_id=${clientId}&device_code=${cleanedDeviceCode}&grant_type=urn:ietf:params:oauth:grant-type:device_code`;

    const ms = (Number(interval) + 2) * 1000;

    let accessToken = "";
    let scope = "";
    let tokenType = "";

    const authenticationInterval = setInterval(async () => {
      const response: GitHubOauthStep3Response | GitHubOauthStep3Error = await getData(authUrl, { method: "POST" });

      if ((response as GitHubOauthStep3Error).error !== undefined) {
        if ((response as GitHubOauthStep3Error).error !== "authorization_pending") {
          console.error(response);
          reject("Error when getting authorization response from GitHub!");
        }
      } else {
        accessToken = (response as GitHubOauthStep3Response).access_token;
        scope = (response as GitHubOauthStep3Response).scope;
        tokenType = (response as GitHubOauthStep3Response).token_type;
        clearInterval(authenticationInterval);
        resolve({ accessToken, scope, tokenType });
      }

    }, ms);
  } catch (error) {
    reject(error);
  }
});
