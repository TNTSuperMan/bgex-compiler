import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"
import { escapeFunction } from "./compile/util";
import { useVariable, type Variable } from "./compile/var";
import { toExportiveToken, type Exports } from "./exportive";
import { compileBGEX } from "./compile";

export const BGEXCompile = (source: string) => {
    const importlist: Map<string, BGEXModule> = new Map;
    const pathStack: string[] = [];
    for(let sp = resolve(process.cwd(), source); pathStack.length; pathStack.pop())
        if(!importlist.has(sp)){
            const token = parseBGEX(sp);
            if(!token) return;
            pathStack.push(...token.imports.map(e=>e.path));
        }
    const exports: Map<string, Exports> = new Map;
    importlist.forEach(e=>exports.set(e.path, toExportiveToken(e)));

    const results = importlist.values().map(e=>compileBGEX(e, exports));
    console.log(results);
}
