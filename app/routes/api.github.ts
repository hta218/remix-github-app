import { json } from "@remix-run/node";
import type { ActionFunction } from "react-router";
import { getSubmissionData } from "~/utils";
import { createRepoFromTemplate, pushChanges } from "~/utils/github";

export let action: ActionFunction = async ({ request }) => {
  let { access_token, owner, name, repo, path, content, action } =
    await getSubmissionData(request);
  if (action === "create") {
    let repo = await createRepoFromTemplate(access_token, owner, name);
    return json({ repo });
  } else {
    let file = await pushChanges(access_token, owner, repo, path, content);
    return json({ file });
  }
};
