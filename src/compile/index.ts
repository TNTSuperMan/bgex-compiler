import type { BGEXModule } from "../parse";
import { compileFunc } from "./func";
import { escapeFunction } from "./util";
import { parseVariable, type Variable } from "./var";

export type BGEXModules = Map<string, (
    [true, string, string] | //Function
    [false, string, Variable] // Variable
)[]>;

export type BGEXScope = {
    vars: Map<string, Variable>[],
    funcs: Map<string, string>
}

export const compileBGEX = (token: BGEXModule, modules: BGEXModules): string => {
    let asm = [`;${token.path}`];
    
    const scope: BGEXScope = {
        vars:[new Map], funcs: new Map };
    
    token.imports.forEach(e=>{
        const m = modules.get(e.path);
        if(!m) throw new ReferenceError("Not found module: " + e.path)
        e.specifiers.forEach(t=>{
            const v = m.find(e=>e[1] === t[0]);
            if(!v) throw new ReferenceError("Not found token: " + t[0]);
            if(v[0]){
                scope.funcs.set(t[1], v[2]);
            }else{
                scope.vars[0].set(t[1], v[2]);
            }
        })
    })

    const vars: Variable[] = token.vars.map(parseVariable);
    vars.forEach(e=>scope.vars[0].set(e[1], e));

    const fnmap: Map<string, string> = new Map;
    token.funcs.forEach(e=>
        fnmap.set(e.name, e.name + crypto.randomUUID()))
    fnmap.forEach((v,k)=>scope.funcs.set(k, v));

    asm.push(...token.funcs.map(e => compileFunc(scope, e, fnmap.get(e.name))))
    asm.push(...token.exportFunctions.map(e => compileFunc(scope, e, escapeFunction(token.path, e.name))))

    return asm.join("\n");
}
