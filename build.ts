import { build } from "bun";

build({
    entrypoints: ["./src/index.ts"],
    outdir: "dist",
    minify: true
})