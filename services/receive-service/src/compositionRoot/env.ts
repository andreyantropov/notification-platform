import { ENVIRONMENT_TYPE, LOG_LEVEL } from "@notification-platform/telemetry";
import z from "zod";

import pkg from "../../package.json" with { type: "json" };

const RoleSchema = z
  .string()
  .trim()
  .min(3, "Роль должна быть не короче 3 символов")
  .max(128, "Роль не должна превышать 128 символов");

const EnvSchema = z.object({
  NODE_ENV: z.nativeEnum(ENVIRONMENT_TYPE),
  LOG_LEVEL: z.nativeEnum(LOG_LEVEL).default(LOG_LEVEL.INFO),

  SERVICE_NAME: z
    .string()
    .trim()
    .min(3, "name должен быть не короче 3 символов")
    .max(256, "name не должен превышать 256 символов")
    .default(pkg.name),
  SERVICE_PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_URL: z
    .string()
    .trim()
    .url("url должен быть валидным URL (например, http://localhost:3000/api)"),
  SERVICE_TITLE: z
    .string()
    .trim()
    .min(3, "title должен быть не короче 3 символов")
    .max(256, "title не должен превышать 256 символов")
    .default(pkg.name),

  BROKER_URL: z
    .string()
    .trim()
    .url(
      "url должен быть валидным URL (например, amqp://guest:guest@localhost:5672/)",
    ),

  PUBLISHER_EXCHANGE: z.string().trim().default(""),
  PUBLISHER_ROUTING_KEY: z
    .string()
    .trim()
    .min(3, "routingKey должен быть не короче 3 символов")
    .max(256, "routingKey не должен превышать 256 символов"),
  PUBLISHER_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),

  AUTHENTICATION_MIDDLEWARE_ISSUER: z
    .string()
    .trim()
    .url(
      "issuer должен быть валидным URL (например, https://keycloak.example.com/realms/internal)",
    ),
  AUTHENTICATION_MIDDLEWARE_JWKS_URI: z
    .string()
    .trim()
    .url(
      "jwksUri должен быть валидным URL (например, https://keycloak.example.com/realms/internal/protocol/openid-connect/certs)",
    ),
  AUTHENTICATION_MIDDLEWARE_AUDIENCE: z
    .string()
    .trim()
    .min(3, "audience должен быть не короче 3 символов")
    .max(128, "audience не должен превышать 128 символов"),
  AUTHENTICATION_MIDDLEWARE_TOKEN_SIGNING_ALG: z
    .enum(["RS256", "RS384", "RS512", "ES256"])
    .default("RS256"),

  AUTHORIZATION_MIDDLEWARE_SERVICE_CLIENT_ID: z
    .string()
    .trim()
    .min(3, "serviceClientId должен быть не короче 3 символов")
    .max(128, "serviceClientId не должен превышать 128 символов"),
  AUTHORIZATION_MIDDLEWARE_REQUIRED_ROLES: z
    .string()
    .trim()
    .min(1, "requiredRoles не должен быть пустым")
    .max(1024, "requiredRoles не должен превышать 1024 символов")
    .transform((roles) => {
      return roles
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
    })
    .pipe(
      z
        .array(RoleSchema)
        .min(1, "Список ролей не должен быть пустым")
        .max(50, "Список ролей не должен превышать 50 штук"),
    ),

  TELEMETRY_TRACES_EXPORTER_URL: z
    .string()
    .trim()
    .url(
      "tracesExporterUrl должен быть валидным URL (например, http://otel-collector:4318/v1/traces)",
    )
    .optional(),
  TELEMETRY_LOGS_EXPORTER_URL: z
    .string()
    .trim()
    .url(
      "logsExporterUrl должен быть валидным URL (например, http://otel-collector:4318/v1/logs)",
    )
    .optional(),
  TELEMETRY_METRICS_EXPORTER_URL: z
    .string()
    .trim()
    .url(
      "metricsExporterUrl должен быть валидным URL (например, http://otel-collector:4318/v1/metrics)",
    )
    .optional(),
});

export const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;
