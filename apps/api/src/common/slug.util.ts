import { randomUUID } from 'node:crypto';

/** URL-safe slug from a name plus a random suffix, so collisions on common names never happen. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = randomUUID().slice(0, 8);
  return base ? `${base}-${suffix}` : suffix;
}
