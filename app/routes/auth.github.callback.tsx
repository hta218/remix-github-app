import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getRequestQueries } from "~/utils";
import { exchangeCodeForAccessToken } from "~/utils/github";

export let loader: LoaderFunction = async ({ request }) => {
  let { code } = getRequestQueries(request);
  let data = await exchangeCodeForAccessToken(code);
  return json({ data });
};

export default function GithubCallback() {
  let { data } = useLoaderData();
  useEffect(() => {
    window.localStorage.setItem("github-app-credentials", JSON.stringify(data));
  }, [data]);

  return (
    <div className="p-8 text-lg font-medium">
      Authenticated successfully! You can close this tab now.
    </div>
  );
}
