import Redis from 'ioredis';
import type {RuntimeConfig} from "nuxt/schema";

const vars: RuntimeConfig = useRuntimeConfig();

const rPort = parseInt(vars.redisPort, 10);

const redis = new Redis({
    host: vars.redisHost,
    port: rPort,
    password: vars.redisPassword,
});

export default redis;

