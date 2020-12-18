import fetch, { RequestInit } from "node-fetch";
import queryString from "query-string";

import { AuthenticationCredentials, ErrorInfo, GitHubOauthStep1Response, GitHubOauthStep3Error, GitHubOauthStep3Response } from "./types";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getData = async (url: string, options?: RequestInit | undefined): Promise<any | { error: string }> => new Promise((resolve, reject) => {
  try {
    fetch(url, options).then((res) => res.text()).then((text) => resolve(queryString.parse(text)));
  } catch (error) {
    reject({ error });
  }
});

export const isError = (result: AuthenticationCredentials |
  ErrorInfo |
  GitHubOauthStep1Response |
  GitHubOauthStep3Error |
  GitHubOauthStep3Response): result is ErrorInfo => {
  return (result as ErrorInfo).error !== undefined;
};