import type { Metadata } from "next";
import "./fonts.css";
import "./tokens.css";
import "./terminal.css";

export const metadata: Metadata = {
  title: "DonDevTool — offline dev terminal",
  description:
    "A local, offline collection of developer utilities in a retro terminal UI: JSON, YAML, Base64, hashing, JWT, regex, cron, diff, and more.",
};

// Applied before paint to avoid a theme flash / hydration mismatch on <html>.
const themeBootstrap = `(function(){try{
  var d=document.documentElement, s=localStorage;
  d.setAttribute('data-theme', s.getItem('ddt:theme')||'light');
  d.setAttribute('data-accent', s.getItem('ddt:accent')||'amber');
  d.setAttribute('data-glow', (s.getItem('ddt:glow')||'on'));
  d.setAttribute('data-blink', (s.getItem('ddt:blink')||'on'));
  var sl=s.getItem('ddt:scanlines'); if(sl!=null) d.style.setProperty('--scanline-opacity',(parseInt(sl,10)/100).toFixed(3));
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" data-accent="amber" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        {children}
        <div id="scanlines" aria-hidden="true" />
        <div id="vignette" aria-hidden="true" />
      </body>
    </html>
  );
}
