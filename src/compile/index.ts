import { toExportiveFunction, type Exports, type FunctionExport } from "../exportive";
import type { BGEXModule, MacroType } from "../parse";
import type { BGEXFunction } from "../parse/func";
import { compileFunc } from "./func";
import { escapeFunction } from "./util";
import { parseVariable, type Variable } from "./var";

export type BGEXScope = {
    vars: Map<string, Variable>[],
    funcs: Map<string, FunctionExport>,
    macro?: MacroType
}

export const compileBGEX = (token: BGEXModule, exports: Map<string, Exports>): string => {
    let asm = [`;@@ ${token.path}`];
    
    const scope: BGEXScope = {
        vars:[new Map], funcs: new Map, macro: token.macro };
    
    token.imports.forEach(e=>{
        const m = exports.get(e.path);
        if(!m) throw new ReferenceError("Not found module: " + e.path)
        e.specifiers.forEach(t=>{
            const res = m.find(e=>e[1] == t[0]);
            if(!res) throw new ReferenceError("Not found token: " + t[0]);
            if(res[0] == 0){
                scope.funcs.set(res[1], res);
            }else{
                scope.vars[0].set(res[1], res[2]);
            }
        })
    })

    const vars: Variable[] = token.vars.map(parseVariable);
    vars.forEach(e=>scope.vars[0].set(e[1], e));

    const fnmap: [BGEXFunction, `${string}-${string}-${string}-${string}-${string}`][] = token.funcs.map(e=>[e, crypto.randomUUID()]);
    fnmap.forEach(e=>scope.funcs.set(e[0].name, toExportiveFunction(e[0], e[1])))

    asm.push(...fnmap.map(e => compileFunc(scope, e[0], escapeFunction(e[1], e[0].name))))
    asm.push(...token.exportFunctions.map(e => compileFunc(scope, e, escapeFunction(token.path, e.name))))

    return asm.join("\n");
}
