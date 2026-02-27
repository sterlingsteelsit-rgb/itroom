import { Permission } from "../models/Permission";

type CacheEntry = { actions: Set<string>; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

type PermissionLean = { actions?: string[] };

export async function getStaffActions(moduleKey: string): Promise<Set<string>> {
  const key = `staff:${moduleKey}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.actions;

  const doc = await Permission.findOne({
    role: "staff",
    moduleKey,
  }).lean<PermissionLean>();

  const actions = new Set<string>(doc?.actions ?? []);
  cache.set(key, { actions, expiresAt: now + TTL_MS });
  return actions;
}

export function invalidatePermCache(moduleKey?: string) {
  if (!moduleKey) return cache.clear();
  cache.delete(`staff:${moduleKey}`);
}
