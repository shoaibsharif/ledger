export { };

declare global {
  interface Env {
    DB: D1Database;
    AUTH_PASSWORD_HASH: string;
  }
}

declare module "cloudflare:workers" {
  import "cloudflare:workers";
  export const env: Env;
}

