import { type Initiator } from "@notification-platform/core";
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

export const parseInitiator = (payload: unknown): Initiator => {
  return InitiatorSchema.parse(payload);
};
