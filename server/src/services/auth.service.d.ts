declare const registerUser: (name: string, email: string, password: string) => Promise<{
    user: {
        createdAt: Date;
        email: string;
        id: string;
        name: string;
    };
    token: string;
}>;
declare const loginUser: (email: string, password: string) => Promise<{
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
}>;
declare const _default: {
    registerUser: typeof registerUser;
    loginUser: typeof loginUser;
};
export default _default;
//# sourceMappingURL=auth.service.d.ts.map