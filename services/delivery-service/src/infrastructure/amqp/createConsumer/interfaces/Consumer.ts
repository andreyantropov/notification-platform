export interface Consumer {
  readonly consume: () => Promise<void>;
}
