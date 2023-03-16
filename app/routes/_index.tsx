import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { App } from "octokit";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useGithubInstallation } from "~/hooks/use-github-installation";
import { useEffect, useState } from "react";
import { getSubmissionData, rootFileContent } from "~/utils";
import { fetchUserData } from "~/utils/github";

export let loader: LoaderFunction = async () => {
  let app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_SECRET!,
  });
  let appData = await app.octokit.request("/app");
  return json({
    data: appData.data,
    env: {
      githubClientId: process.env.GITHUB_APP_CLIENT_ID,
      callbackUrl: `${process.env.APP_URL}/auth/github/callback`,
    },
  });
};

export let action: ActionFunction = async ({ request }) => {
  let submitData = await getSubmissionData(request);
  let user = await fetchUserData(submitData.access_token);
  return json({ user });
};

export default function Index() {
  let { data } = useLoaderData();
  let [authenticated, setAuthenticated] = useState(false);
  let [credentials, setCredentials] = useState<null | any>(null);
  let { handleInstallApp } = useGithubInstallation((cre) => {
    setAuthenticated(true);
    setCredentials(cre);
  });
  let [repoName, setRepoName] = useState("");
  let [fileContent, setFileContent] = useState(rootFileContent);

  let userFetcher = useFetcher();
  let repoFetcher = useFetcher();
  useEffect(() => {
    if (authenticated) {
      userFetcher.submit(
        { data: JSON.stringify({ access_token: credentials.access_token }) },
        {
          action: "/?index",
          method: "post",
          replace: true,
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  let handleCreateRepo = () => {
    repoFetcher.submit(
      {
        data: JSON.stringify({
          action: "create",
          access_token: credentials.access_token,
          owner: userFetcher.data.user.login,
          name: repoName,
        }),
      },
      {
        action: "/api/github",
        method: "post",
        replace: true,
      }
    );
  };
  let handleUpdateRepo = () => {
    repoFetcher.submit(
      {
        data: JSON.stringify({
          action: "update",
          access_token: credentials.access_token,
          owner: userFetcher.data.user.login,
          repo: repoName,
          path: "app/root.jsx",
          content: fileContent,
        }),
      },
      {
        action: "/api/github",
        method: "post",
        replace: true,
      }
    );
  };

  return (
    <main className="p-16 space-y-8">
      <h1 className="text-5xl font-medium">Weaverse github app</h1>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={handleInstallApp}
            >
              Install Github App
            </button>
          </div>
          {authenticated && (
            <div className="space-y-2">
              <p>Create hydrogen storefront repo</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded p-2"
                  placeholder="Repo name"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  onClick={handleCreateRepo}
                >
                  {repoFetcher.state === "submitting"
                    ? "Creating..."
                    : "Create a repo"}
                </button>
              </div>
            </div>
          )}
          {authenticated && repoFetcher.data && (
            <div className="space-y-2">
              <p>Edit code</p>
              <div className="flex flex-col space-y-2">
                <textarea
                  className="border border-gray-300 rounded p-2 w-full"
                  placeholder="File content"
                  value={fileContent}
                  rows={30}
                  onChange={(e) => setFileContent(e.target.value)}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded self-start"
                  onClick={handleUpdateRepo}
                >
                  {repoFetcher.state === "submitting"
                    ? "Pushing changes..."
                    : "Commit & push"}
                </button>
              </div>
            </div>
          )}
        </div>
        <details className="space-y-2">
          <summary className="text-green-600 font-medium cursor-pointer">
            App data
          </summary>
          <pre className="bg-info-100 p-4 text-base">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
        {authenticated && (
          <details className="space-y-2">
            <summary className="text-green-600 font-medium cursor-pointer">
              Credentials
            </summary>
            <pre className="bg-info-100 p-4 text-base">
              {JSON.stringify(credentials, null, 2)}
            </pre>
          </details>
        )}
        {authenticated && userFetcher.state === "submitting" && (
          <div>Fetching user data...</div>
        )}
        {authenticated && userFetcher.data && (
          <details className="space-y-2">
            <summary className="text-green-600 font-medium cursor-pointer">
              User info
            </summary>
            <pre className="bg-info-100 p-4 text-base">
              {JSON.stringify(userFetcher.data, null, 2)}
            </pre>
          </details>
        )}
        {authenticated && repoFetcher.state === "submitting" && (
          <div>Creating a repo...</div>
        )}
        {authenticated && repoFetcher.data && (
          <details className="space-y-2">
            <summary className="text-green-600 font-medium cursor-pointer">
              Repo info
            </summary>
            <pre className="bg-info-100 p-4 text-base">
              {JSON.stringify(repoFetcher.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
