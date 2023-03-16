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

export async function createRepoFromTemplate(
  accessToken: string,
  owner: string,
  name: string
) {
  let octokit = new Octokit({
    auth: accessToken,
  });
  return await octokit.request("POST /repos/hta218/shopify-h2-demo/generate", {
    owner,
    name,
    description: "Hydrogen storefront template created by Weaverse app",
    include_all_branches: false,
    private: false,
    headers: {
      Accepts: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

export async function pushChanges(
	accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string
) {
  let octokit = new Octokit({
    auth: accessToken,
  });

  let file = await octokit.request(
    `GET /repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Accepts: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
    message: "Update root",
    content: Buffer.from(content).toString("base64"),
    sha: file.data.sha,
    headers: {
      Accepts: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}
