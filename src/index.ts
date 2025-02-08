import { parseBGEX } from "./parse"

export const BGEXCompile = (source: string) => {
    return parseBGEX(process.cwd(), source);
}
