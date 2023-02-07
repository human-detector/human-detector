require("esbuild")
  .build({
    platform: "node",
    entryPoints: ["src/main.ts"],
    external: ["pg-native"],
    outdir: "dist",
    bundle: true,
  })
  .then(() => console.log("Done"))
  .catch(() => process.exit(1));
