import { Octokit } from "octokit";

let GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";

export async function exchangeCodeForAccessToken(code: string) {
  let url = new URL(GITHUB_ACCESS_TOKEN_API);
  url.searchParams.set("client_id", process.env.GITHUB_APP_CLIENT_ID!);
  url.searchParams.set("client_secret", process.env.GITHUB_APP_CLIENT_SECRET!);
  url.searchParams.set("code", code);
  url.searchParams.set(
    "redirect_uri",
    `${process.env.APP_URL}/auth/github/callback`
  );
  let res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  return await res.json();
}

export async function fetchUserData(accessToken: string) {
  let res = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return await res.json();
}

export async function createRepo(accessToken: string) {
  let octokit = new Octokit({
    auth: accessToken,
  });

  return await octokit.request("POST /user/repos", {
    name: "repo-created-by-weaverse-github-app",
    description: "This is a repo created by Weaverse GitHub App",
    homepage: "https://github.com",
    private: false,
    is_template: true,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}
