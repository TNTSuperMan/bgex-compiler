import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"
import { escapeFunction } from "./compile/util";
import { useVariable, type Variable } from "./compile/var";
import { toExportiveToken, type Exports } from "./exportive";

export const BGEXCompile = (source: string) => {
    const importlist: Map<string, BGEXModule> = new Map;
    const pathStack: string[] = [resolve(process.cwd(), source)];
    while(pathStack.length)
        if(!importlist.has(pathStack[0])){
            const token = parseBGEX(pathStack[0]);
            if(!token) return;
            pathStack.push(...token.imports.map(e=>e.path));
        }
    const exports: Map<string, Exports> = new Map;
    importlist.forEach(e=>exports.set(e.path, toExportiveToken(e)))
}
