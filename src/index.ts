import { resolve } from "node:path";
import { parseBGEX, type BGEXModule } from "./parse"

export const BGEXCompile = (source: string) => {
    const importlist: Map<string, BGEXModule> = new Map;
    const pathStack: string[] = [resolve(process.cwd(), source)];
    while(pathStack.length)
        if(!importlist.has(pathStack[0])){
            const token = parseBGEX(pathStack[0]);
            if(!token) return;
            pathStack.push(...token.imports.map(e=>e.path));
        }
}
