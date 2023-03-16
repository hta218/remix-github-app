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

export let rootFileContent = `
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import styles from './styles/app.css';
import favicon from '../public/favicon.svg';

export const links = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export const meta = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader({context}) {
  const layout = await context.storefront.query(LAYOUT_QUERY);
  return {layout};
}

export default function App() {
  const data = useLoaderData();

  const {name} = data.layout.shop;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hello, {name}</h1>
        <p>This is a custom storefront powered by Hydrogen</p>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = \`#graphql
  query layout {
    shop {
      name
      description
    }
  }
\`;
`;
