import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"
import { toExportiveFunction, toExportiveToken, type Exports } from "./exportive";
import { compileBGEX } from "./compile";
import { assemble } from "./assemble";
import { escapeFunction } from "./compile/util";
import { lib } from "./compile/stdlib";
import { initialize, varMap } from "./compile/var";

export type { MacroType } from "./parse/index"

export const BGEXCompile = async (source: string, entrypoint: string, resources?: () => string): Promise<[string, [number, string, string][], number[]?]|void> => {
    initialize();
    const importlist: Map<string, BGEXModule> = new Map;
    const absSP = resolve(process.cwd(), source);
    const pathStack: string[] = [absSP];
    for(let sp = absSP; pathStack.length; sp = pathStack.pop()??"")
        if(sp && !importlist.has(sp)){
            const token = await parseBGEX(sp);
            if(!token) return;
            importlist.set(sp, token);
            pathStack.push(...token.imports.map(e=>e.path));
        }
    const exports: Map<string, Exports> = new Map;
    importlist.forEach(e=>exports.set(e.path, toExportiveToken(e)));

    const results = importlist.values().map(e=>compileBGEX(e, exports));
    const assembly = `;entrypoint
/ :fn_${escapeFunction(absSP, entrypoint)} call
/ ret

${lib}
${Array.from(results).join("\n\n")}
${resources?.() ?? ""}`;

    try{
        const binary = assemble(assembly);
        return [assembly, varMap, binary];
    }catch(e){
        console.error(e);
        return [assembly, varMap];
    }
}
