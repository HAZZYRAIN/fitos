import { AuthProvider } from "../lib/AuthContext";

export const metadata = {
  title: "FitOS — Trainer Platform",
  description: "Fitness Trainer & Client Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          ─── CRITICAL MOBILE FIXES ───────────────────────────────────────
          1. viewport: width=device-width stops the "zoomed out" problem.
             initial-scale=1 sets correct zoom on load.
             maximum-scale=1, user-scalable=no prevents iOS from zooming
             when tapping inputs (but still allows pinch in some browsers).
          2. theme-color: matches your dark topbar on Android Chrome.
          3. apple-mobile-web-app-capable: full-screen feel when added to
             iOS home screen.
          ─────────────────────────────────────────────────────────────────
        */}
        <script
  dangerouslySetInnerHTML={{
    __html: `
      if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    `,
  }}
/>        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#faf8f4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#faf8f4" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
