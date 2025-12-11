import {defineConfig} from "tsup";

export default defineConfig({
    entry: ["server.ts", "app.ts"],
    format: ["esm"],
    splitting: false,
    clean: true,
    skipNodeModulesBundle: true,
    sourcemap: true,
    dts: false,
});
