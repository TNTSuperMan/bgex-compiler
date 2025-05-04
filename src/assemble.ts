import { readFileSync, writeFileSync } from "fs"

enum Command{
    nop,push,pop,cls,
    add,sub,mul,div,rem,nand,equal,greater,
    truejump,jump,call,ret,
    load,store,
    dumpkey,
    redraw,rect,graph,
    sound,stopsound,
    io,break
}

export const enum TokenType{
    Push,
    PushTag,
    Command,
    Tag,
    Inject
}
type Token = {
    type: TokenType.Push,
    data: number
} | {
    type: TokenType.PushTag,
    name: string
} | {
    type: TokenType.Command,
    command: Command
} | {
    type: TokenType.Tag,
    name: string,
    at: number
} | {
    type: TokenType.Inject,
    content: Uint8Array
}
const tokenize = (code: string) => {
    const lines = code.replace("\r","").split("\n");
    const tokens: Token[] = [];
    lines.forEach(e=>{
        if(e.startsWith(":"))
            tokens.push({
                type: TokenType.Tag,
                name: e.substring(1),
                at: tokens.reduce((v,e)=>v + (
                    e.type == TokenType.Push ? 2 :
                    e.type == TokenType.PushTag ? 4 :
                    e.type == TokenType.Command ? 1 :
                    e.type == TokenType.Inject ? e.content.length : 0), 0)})
        else if(e.startsWith("/"))
            e.substring(1).split(" ").forEach(e=>{
                let trimed = e.trim()
                if(!trimed) return;
                if(/^[\da-fA-F]{1,2}$/.test(trimed))
                    tokens.push({
                        type: TokenType.Push,
                        data: parseInt(trimed, 16)
                    })
                else if(trimed.startsWith(":"))
                    tokens.push({
                        type: TokenType.PushTag,
                        name: trimed.substring(1)
                    })//@ts-ignore
                else if(Command[trimed])
                    tokens.push({
                        type: TokenType.Command,//@ts-ignore
                        command: Command[trimed]
                    })
                else throw new SyntaxError(`Unknown operator: ${trimed}(${trimed.split("").map(e=>e.charAt(0))})`);
            })
        else if(/^inject\s/.test(e))
            tokens.push({
                type: TokenType.Inject,
                content: readFileSync(e.substring(7))
            })
        else if(/^inject_fromB64\s/.test(e))
            tokens.push({
                type: TokenType.Inject,
                content: new Uint8Array(atob(e.substring(15)).split("").map(e=>e.charCodeAt(0)))
            })
    })
    return tokens;
}

export const assemble = (code: string): [number[], Map<string, number>] => {
    const tokens = tokenize(code);
    const tags = tokens.filter(e=>e.type == TokenType.Tag);
    const bins: number[] = [];
    tokens.forEach(e=>{
        if(e.type == TokenType.Push)
            bins.push(1, e.data);
        else if(e.type == TokenType.PushTag){
            const tag = tags.find(t=>t.name == e.name);
            if(!tag) throw new ReferenceError("Not found tag: "+e.name);
            bins.push(1, Math.floor(tag.at / 256), 1, tag.at % 256);
        }else if(e.type == TokenType.Command)
            bins.push(e.command)
        else if(e.type == TokenType.Inject)
            bins.push(...e.content);
    })
    return [bins, new Map(tags.map(e=>[e.name, e.at]))];
}
