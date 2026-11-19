import { z } from "zod";
export declare const createChatSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createChatMessageSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=chat.schema.d.ts.map