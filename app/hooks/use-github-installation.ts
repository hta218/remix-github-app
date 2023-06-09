import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/routes/_index";
import { openWindowPopup } from "~/utils";

export function useGithubInstallation(onAuthenticated: (data: any) => void) {
  let { data } = useLoaderData<typeof loader>();
  let handleInstallApp = () => {
    let installURL = `https://github.com/apps/${data.slug}/installations/new`;
    openWindowPopup(installURL, { width: 800, height: 800 });
    window.addEventListener("storage", (e: StorageEvent) => {
      /**
       * There might be an edge case here if user open multiple windows and connect to multiple accounts
       * In this case, the storage event will be fired multiple times
       * We need to make sure that we only handle the event once
       * Solution (future): set separate key for each Instagram element using element's id
       */
      if (e.key === "github-app-credentials") {
        if (e.newValue === null) return;
        let data = JSON.parse(e.newValue);
        onAuthenticated?.(data);
        localStorage.removeItem("github-app-credentials");
      }
    });
  };
  return { handleInstallApp };
}
