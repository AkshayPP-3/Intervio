declare const getUserById: (userId: string) => Promise<{
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    updatedAt: Date;
}>;
declare const updateUser: (userId: string, data: {
    name?: string;
    email?: string;
}) => Promise<{
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    updatedAt: Date;
}>;
declare const _default: {
    getUserById: typeof getUserById;
    updateUser: typeof updateUser;
};
export default _default;
//# sourceMappingURL=user.service.d.ts.map