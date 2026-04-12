import { STRATEGY_TYPE } from "@notification-platform/core";
import z from "zod";

const InitiatorSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, "id должен быть не короче 3 символов")
    .max(128, "id не должен превышать 128 символов"),
  name: z
    .string()
    .trim()
    .min(3, "name должен быть не короче 3 символов")
    .max(256, "name не должен превышать 256 символов"),
});

const BitrixContactSchema = z.object({
  type: z.literal("bitrix"),
  value: z.coerce.number().int().positive(),
});

const EmailContactSchema = z.object({
  type: z.literal("email"),
  value: z
    .string()
    .trim()
    .email()
    .min(8, "value (email адрес) должен быть не короче 8 символов")
    .max(256, "value (email адрес) не должен превышать 256 символов"),
});

const ContactSchema = z.discriminatedUnion("type", [
  EmailContactSchema,
  BitrixContactSchema,
]);

const NotificationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  contacts: z
    .array(ContactSchema)
    .min(1, "Список контактов не должен быть пустым")
    .max(50, "Список контактов не должен превышать 50 штук"),
  message: z
    .string()
    .trim()
    .min(1, "message не может быть пустым")
    .max(10_000, "message не должно превышать 10 000 символов"),
  strategy: z.nativeEnum(STRATEGY_TYPE),
  initiator: InitiatorSchema,
});

type Notification = z.infer<typeof NotificationSchema>;

export const validateNotification = (
  payload: unknown,
): z.SafeParseReturnType<z.input<typeof NotificationSchema>, Notification> => {
  return NotificationSchema.safeParse(payload);
};
