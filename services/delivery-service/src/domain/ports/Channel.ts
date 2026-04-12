import { type ChannelType, type Contact } from "@notification-platform/core";

export interface Channel {
  readonly type: ChannelType;
  readonly isSupports: (contact: Contact) => boolean;
  readonly send: (contact: Contact, message: string) => Promise<void>;
  readonly checkHealth?: () => Promise<void>;
}
