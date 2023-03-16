import { json } from "@remix-run/node";
import type { ActionFunction } from "react-router";
import { getSubmissionData } from "~/utils";
import { createRepo } from "~/utils/github";

export let action: ActionFunction = async ({ request }) => {
  let submitData = await getSubmissionData(request);
  let repo = await createRepo(submitData.access_token);
  return json({ repo });
};
