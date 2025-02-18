import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"
import { toExportiveToken, type Exports } from "./exportive";
import { compileBGEX } from "./compile";
import { assemble } from "./assemble";

export type { MacroType } from "./parse/index"

export const BGEXCompile = async (source: string): Promise<[string, number[]]|void> => {
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
    const assembly = Array.from(results).join("\n\n");

    const binary = assemble(assembly);

    return [assembly, binary]
}
