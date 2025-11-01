import { delay } from "../delay";

type ProcessFunction<T> = (element: T) => Promise<void>;

export class SequentialProcessor<T> {
  private queue: T[] = [];
  private isProcessing: boolean = false;
  private readonly minDelayMs: number;
  private readonly processFn: ProcessFunction<T>;

  constructor(processFn: ProcessFunction<T>, minDelayMs: number) {
    this.processFn = processFn;
    this.minDelayMs = minDelayMs;
  }

  public enqueue(element: T): void {
    this.queue.push(element);
    this.startProcess();
  }

  private async startProcess(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const element = this.queue.shift()!;

      try {
        await this.processFn(element);
      } catch (error) {
        console.warn(error);
        // Continue processing the rest of the queue.
      }

      await delay(this.minDelayMs);
    }

    this.isProcessing = false;
  }
}
