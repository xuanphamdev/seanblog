const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  if (!path.startsWith("/")) {
    return path;
  }

  return `${basePath}${path}` || path;
}

export function withoutBase(path: string): string {
  if (!basePath) {
    return path;
  }

  if (path === basePath) {
    return "/";
  }

  return path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
}
