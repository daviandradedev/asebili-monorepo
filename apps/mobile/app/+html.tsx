import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
                margin: 0;
              }
              body {
                background: #e8ecf1;
                overflow: hidden;
              }
              #root {
                display: flex;
                justify-content: center;
              }
              input,
              textarea {
                outline: none;
              }
              input[data-class-code-slot="true"] {
                box-sizing: border-box;
                text-align: center;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
