import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { App } from "octokit";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useGithubInstallation } from "~/hooks/use-github-installation";
import { useEffect, useState } from "react";
import { getSubmissionData } from "~/utils";
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
      { data: JSON.stringify({ access_token: credentials.access_token }) },
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
        <div className="space-y-2">
          <p className="text-green-600 font-medium">App data</p>
          <pre className="bg-info-100 p-4 text-base">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={handleInstallApp}
          >
            Install Github App
          </button>
          {authenticated && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={handleCreateRepo}
            >
              {repoFetcher.state === "submitting"
                ? "Creating..."
                : "Create a repo"}
            </button>
          )}
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="space-y-8">
          {authenticated && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                Authenticated successfully!
              </p>
              <pre className="bg-info-100 p-4 text-base">
                {JSON.stringify(credentials, null, 2)}
              </pre>
            </div>
          )}
          {authenticated && userFetcher.state === "submitting" && (
            <div>Fetching user data...</div>
          )}
          {authenticated && userFetcher.data && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">User info!</p>
              <pre className="bg-info-100 p-4 text-base">
                {JSON.stringify(userFetcher.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="space-y-8">
          {authenticated && repoFetcher.state === "submitting" && (
            <div>Creating a repo...</div>
          )}
          {authenticated && repoFetcher.data && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">Repo info!</p>
              <pre className="bg-info-100 p-4 text-base">
                {JSON.stringify(repoFetcher.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
