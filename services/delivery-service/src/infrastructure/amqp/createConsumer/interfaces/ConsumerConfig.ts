export interface ConsumerConfig {
  readonly queue: string;
  readonly prefetchCount: number;
}
