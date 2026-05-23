/**
 * lib/persona-routing.js
 * space_slug → persona slug 映射
 * 这里做缓存，避免每次 SpaceDetail 都要推导
 */

/** 从 space 对象解出关联的 persona slug */
export function getPersonaSlug(space) {
  // host 类型：persona slug === host_person_slug
  if (space?.host_person_slug) return space.host_person_slug;
  // 兜底：用 space.slug 本身（如果命名一致的话）
  return space?.slug ?? null;
}

/** 村管家永远是龙寻 */
export const STEWARD_SLUG = 'longxun';
