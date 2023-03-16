export type WindowPopupSize = {
  width: number;
  height: number;
};

export function openWindowPopup(
  url: string,
  size: WindowPopupSize = { width: 450, height: 650 }
) {
  let { width: w, height: h } = size;

  let dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  let dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  let width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  let height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  let systemZoom = width / window.screen.availWidth;
  let left = (width - w) / 2 / systemZoom + dualScreenLeft;
  let top = (height - h) / 2 / systemZoom + dualScreenTop;

  return window.open(
    url,
    "_blank",
    `popup,top=${top},left=${left},width=${w},height=${h}`
  );
}

export function getRequestQueries<T = Record<string, string>>(
  request: Request
) {
  let url = new URL(request.url);
  return Array.from(url.searchParams.entries()).reduce((q, [k, v]) => {
    // @ts-ignore
    q[k] = v;
    return q;
  }, {}) as T;
}

/**
 * Get data submitted by `useRouteSubmission` hook
 *
 * @param request - The request object
 */
export async function getSubmissionData(request: Request) {
  if (request.method === "DELETE") return null;
  let formData = await request.formData();
  return JSON.parse(formData.get("data") as string);
}
