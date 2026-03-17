/**
 * 请求队列 - 纯并发限制器
 * 第一阶段唯一职责：限制并发数，添加请求间隔
 * 禁止：优先级管理、统计、生命周期管理
 */

export class RequestQueue {
  private maxConcurrent: number;
  private intervalMs: number;
  private running: number = 0;
  private queue: Array<{
    task: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor(maxConcurrent = 2, intervalMs = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.intervalMs = intervalMs;
  }

  /**
   * 入队执行任务
   */
  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    // 已达并发上限，等待
    if (this.running >= this.maxConcurrent) {
      return;
    }

    // 队列为空，返回
    if (this.queue.length === 0) {
      return;
    }

    // 获取下一个任务
    const item = this.queue.shift();
    if (!item) return;

    this.running++;

    try {
      // 执行任务
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      // 任务完成后间隔一段时间再处理下一个
      setTimeout(() => {
        this.running--;
        this.process();
      }, this.intervalMs);
    }
  }

  /**
   * 获取当前状态（仅用于调试）
   */
  getState() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// 全局实例
export const requestQueue = new RequestQueue(2, 1000);
