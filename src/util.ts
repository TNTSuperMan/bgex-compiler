export const serr = (message: string, at: number): never => {
    throw new SyntaxError(message, {cause: at})
}