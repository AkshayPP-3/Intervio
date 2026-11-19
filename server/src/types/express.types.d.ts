declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
            };
        }
    }
}
export {};
//# sourceMappingURL=express.types.d.ts.map