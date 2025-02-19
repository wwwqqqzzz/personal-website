import { defineCollection, z } from 'astro:content';
import { PostSchema } from '../lib/schemas';

const posts = defineCollection({
  type: 'content',
  schema: PostSchema
});

export const collections = {
  posts
}; 