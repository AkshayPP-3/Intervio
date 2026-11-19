declare class appError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export default appError;
//# sourceMappingURL=appError.d.ts.map