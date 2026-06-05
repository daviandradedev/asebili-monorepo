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
                width: 100%;
                height: 100%;
                min-height: 100dvh;
                margin: 0;
              }
              body {
                background: #e8ecf1;
                overflow: hidden;
              }
              #root {
                display: flex;
                flex: 1;
                width: 100%;
                min-height: 100dvh;
                justify-content: center;
              }
              #root > div {
                width: 100%;
                min-height: 100dvh;
                flex: 1;
                display: flex;
                justify-content: center;
              }
              #root [style*="width:0px"][style*="height:0px"] {
                width: 100% !important;
                min-height: 100dvh !important;
                height: auto !important;
                flex: 1 !important;
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
