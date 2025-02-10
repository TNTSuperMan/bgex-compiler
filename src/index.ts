import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"
import type { BGEXModules } from "./compile";
import { escapeFunction } from "./compile/util";
import { useVariable, type Variable } from "./compile/var";

export const BGEXCompile = (source: string) => {
    const importlist: Map<string, BGEXModule> = new Map;
    const pathStack: string[] = [resolve(process.cwd(), source)];
    while(pathStack.length)
        if(!importlist.has(pathStack[0])){
            const token = parseBGEX(pathStack[0]);
            if(!token) return;
            pathStack.push(...token.imports.map(e=>e.path));
        }
    const modules: BGEXModules = new Map;
    importlist.forEach(e=>{
        modules.set(e.path, [
            ...e.exportFunctions.map<[true, string, string]>(t=>[true, t.name, escapeFunction(e.path, t.name)]),
            ...e.exportVariables.map<[false, string, Variable]>(t=>[false, t.name, useVariable(t.name)]),
        ])
    })
}
