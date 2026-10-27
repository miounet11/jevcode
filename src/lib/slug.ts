/** owner/repo → URL 安全的实体 slug。反向查询由 findProjectBySlug 完成。 */
export function projectSlug(repo: string): string {
  return repo
    .toLowerCase()
    .replace(/\//g, '--')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{3,}/g, '--')
    .replace(/^-+|-+$/g, '');
}
