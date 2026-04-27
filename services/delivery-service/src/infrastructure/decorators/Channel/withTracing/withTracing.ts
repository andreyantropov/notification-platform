import { type Contact } from "@notification-platform/core";
import { SPAN_KIND } from "@notification-platform/telemetry";

import { type Channel } from "../../../../domain/ports/index.js";

import { type TracingDependencies } from "./interfaces/index.js";

export const withTracing = (dependencies: TracingDependencies): Channel => {
  const { channel, tracer } = dependencies;

  const send = async (contact: Contact, message: string): Promise<void> => {
    return tracer.startActiveSpan(
      `notification.send_to_channel`,
      async () => {
        await channel.send(contact, message);
      },
      {
        kind: SPAN_KIND.CLIENT,
        attributes: {
          channel: channel.type,
          contact: contact.type,
        },
      },
    );
  };

  return {
    ...channel,
    send,
  };
};
