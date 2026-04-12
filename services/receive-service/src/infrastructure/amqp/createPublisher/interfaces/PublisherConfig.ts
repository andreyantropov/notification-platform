export interface PublisherConfig {
  readonly exchange: string;
  readonly routingKey: string;
  readonly timeoutMs: number;
}
