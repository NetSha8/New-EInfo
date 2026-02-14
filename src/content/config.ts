import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    readTime: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  'blog': blogCollection,
};
