import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/writing' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    updatedAt: z.string(),
  }),
});

export const collections = { writing };
