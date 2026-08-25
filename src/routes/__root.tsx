import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { QualityProvider } from "@/game/quality";
import appCss from "../styles.css?url";

const APP_NAME = "The Dinoverse";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "The bones went on-chain. The dinosaurs never left. $DINOVERSE is an independent Solana meme universe inspired by dinosaur fossil tokenisation. Not affiliated with Jurassic Finance, Solana, the Solana Foundation or Anatoly Yakovenko.",
      },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#0b0d0b" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "x:game" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content:
          "Independent Solana meme universe inspired by dinosaur fossil tokenisation. Not affiliated with Jurassic Finance, Solana, the Solana Foundation or Anatoly Yakovenko.",
      },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "preload", as: "video", href: "/intro.mp4?v=5", type: "video/mp4" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Unbounded:wght@500;600&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <QualityProvider>
        <AuthProvider>
          <Outlet />
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              className: "bg-surface text-fg border-border",
            }}
          />
        </AuthProvider>
        </QualityProvider>
        <Scripts />
      </body>
    </html>
  );
}
