export const ptr2asm = (ptr: number) => 
    `${Math.floor(ptr/256).toString(16)} ${(ptr%256).toString(16)}`
export const escapeFunction = (path: string, name: string) => path.replaceAll(/(\/|\\|:)/,"_") + "_" + name;
