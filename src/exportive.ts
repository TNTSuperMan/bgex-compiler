import { escapeFunction } from "./compile/util"
import { parseVariable, type Variable } from "./compile/var";
import type { BGEXModule } from "./parse"
import type { BGEXFunction } from "./parse/func";

// name, tag, argc
export type FunctionExport = [0, string, string, number];
type VariableExport = [1, string, Variable];

export type Exports = (FunctionExport | VariableExport)[]

export const toExportiveFunction = (fn: BGEXFunction, path: string): FunctionExport =>
    [0, fn.name, escapeFunction(path, fn.name), fn.args.length]

export const toExportiveToken = (module: BGEXModule): Exports =>
    [...module.exportFunctions.map<FunctionExport>(e=>toExportiveFunction(e, module.path)),
    ...module.exportVariables.map<VariableExport>(e=>[1, e.name, parseVariable({
        vars: [], funcs: new Map, path: module.path, getAt: () => [0, 0]
    }, e)])]
