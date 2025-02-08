export const ptr2asm = (ptr: number) => 
    `${Math.floor(ptr/256).toString(16)} ${(ptr%256).toString(16)}`
