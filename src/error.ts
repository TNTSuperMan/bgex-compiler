export const printError = (error: unknown, at?: string) => {
    if(error instanceof Error){
        console.log(`Internal callstack: ${error.stack}`);
        console.error(`${error.name}: ${error.message}` + (at ? ` at ${at}` : ""));
    }else throw error;
}
