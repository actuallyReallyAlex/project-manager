export interface AuthenticationCredentials {
  accessToken: string;
  scope: string;
  tokenType: string;
}

export interface ErrorInfo {
  error: string;
}

export interface GitHubOauthStep3Error {
  error: "access_denied" | "authorization_pending" | "expired_token" | "incorrect_client_credentials" | "incorrect_device_code" | "slow_down" | "unsupported_grant_type"
  error_description: string;
  error_uri: string;
}

export interface GitHubOauthStep3Response {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface GitHubOauthStep1Response {
  device_code: string;
  expires_in: string;
  interval: string;
  user_code: string;
  verification_uri: string;
}