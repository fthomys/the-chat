// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "node:path";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['@/assets/app.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    redisHost: process.env.VALKEY_HOST as string,
    redisPort: process.env.VALKEY_PORT as string,
    redisPassword: process.env.VALKEY_PASSWORD as string,
  } satisfies { redisHost: string; redisPort: string; redisPassword: string; },
});