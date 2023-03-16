import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { App } from "octokit";
import { useLoaderData } from "@remix-run/react";
import { useGithubInstallation } from "~/hooks/use-github-installation";
import { useState } from "react";

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

export default function Index() {
  let { data } = useLoaderData();
  let [authenticated, setAuthenticated] = useState(false);
  let [credentials, setCredentials] = useState<null | any>(null);
  let { handleInstallApp } = useGithubInstallation((cre) => {
    setAuthenticated(true);
    setCredentials(cre);
  });

  return (
    <main className="p-16 space-y-8">
      <h1 className="text-5xl font-medium">Weaverse github app</h1>
      <div className="space-y-6">
        <div>App name: {data.name}</div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          onClick={handleInstallApp}
        >
          Install Github App
        </button>
      </div>
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
    </main>
  );
}
