declare const createProfile: (userId: string, data: {
    bio?: string;
    phone?: string;
    location?: string;
    education?: string;
    skills?: string;
}) => Promise<{
    id: string;
    userId: string;
    bio: string | null;
    phone: string | null;
    location: string | null;
    education: string | null;
    skills: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const getProfileByUserId: (userId: string) => Promise<{
    id: string;
    userId: string;
    bio: string | null;
    phone: string | null;
    location: string | null;
    education: string | null;
    skills: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const updateProfile: (userId: string, data: {
    bio?: string;
    phone?: string;
    location?: string;
    education?: string;
    skills?: string;
}) => Promise<{
    id: string;
    userId: string;
    bio: string | null;
    phone: string | null;
    location: string | null;
    education: string | null;
    skills: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const deleteProfile: (userId: string) => Promise<void>;
declare const _default: {
    createProfile: typeof createProfile;
    getProfileByUserId: typeof getProfileByUserId;
    updateProfile: typeof updateProfile;
    deleteProfile: typeof deleteProfile;
};
export default _default;
//# sourceMappingURL=profile.services.d.ts.map