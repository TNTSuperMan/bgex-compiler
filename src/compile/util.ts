export const ptr2asm = (ptr: number) => 
    `${Math.floor(ptr/256).toString(16).padStart(2, "0")} ${(ptr%256).toString(16).padStart(2, "0")}`
export const escapeFunction = (path: string, name: string) => path
    .replaceAll("/", "_")
    .replaceAll("\\","_")
    .replaceAll(":", "_") + "_" + name;
