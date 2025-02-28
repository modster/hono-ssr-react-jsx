// Import all packages from the same source to avoid version conflicts
import { Hono } from "hono";
import { reactRenderer } from "@hono/react-renderer";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { serveStatic } from "hono/deno";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const stream = new Hono().basePath("/stream");

stream.use("*", logger(), poweredBy());
stream.all("/favicon.ico", serveStatic({ path: "../public/favicon.ico" }));
stream.all("/styles.css", serveStatic({ path: "../public/styles.css" }));

type Props = {
  title: string;
  children?: ReactNode;
};

const AsyncComponent = async () => {
  await new Promise((r) => setTimeout(r, 2000)); // sleep 2s
  return <div>Hi!</div>;
};
stream.get(
  "*",
  reactRenderer(
    (props) => {
      return (
        <html>
          <head>
            <title>SSR Streaming</title>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </head>
          <body>
            <h1>SSR Streaming</h1>
            {props.children}
          </body>
        </html>
      );
    },
    { stream: true },
  ),
);

stream.get("/", (c) => {
  return c.render(
    <>
      <Suspense fallback={<div>loading...</div>}>
        <AsyncComponent />
      </Suspense>
    </>,
  );
});
export default stream;
