import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export → produces an `out/` folder of plain files you can
  // upload to any static host (cPanel, etc.). The app is fully client-side and
  // hash-routed, so a single index.html + assets is all it needs — no Node
  // server and no .htaccess rewrites required.
  output: "export",

  // Pin the workspace root — a stray lockfile in the home directory otherwise
  // makes Turbopack infer the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
