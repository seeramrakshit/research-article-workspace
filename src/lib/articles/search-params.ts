import { z } from "zod";

export const articleSearchParamsSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["ALL", "UNSCREENED", "INCLUDED", "EXCLUDED", "MAYBE"]).default("ALL"),
  sort: z.enum(["title", "publicationYear", "createdAt", "firstAuthor"]).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type ArticleSearchParams = z.infer<typeof articleSearchParamsSchema>;