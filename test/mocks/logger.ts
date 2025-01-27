import { FastifyBaseLogger } from 'fastify';

interface Log {
  level: string;
  args: any[];
}

export class MockLogger implements FastifyBaseLogger {
  static logs: Log[] = [];

  constructor() {
    MockLogger.logs = [];
  }

  #pushLogs(args: any[], level: string) {
    MockLogger.logs.push({ level, args });
  }

  level = 'info';

  info(...args: any[]) {
    this.#pushLogs(args, 'info');
  }
  error(...args: any[]) {
    this.#pushLogs(args, 'error');
  }
  debug(...args: any[]) {
    this.#pushLogs(args, 'debug');
  }
  fatal(...args: any[]) {
    this.#pushLogs(args, 'fatal');
  }
  warn(...args: any[]) {
    this.#pushLogs(args, 'warn');
  }
  trace(...args: any[]) {
    this.#pushLogs(args, 'trace');
  }
  silent() {
    // noop to match fastify logger contract
  }

  child: FastifyBaseLogger['child'] = (_bindings, _options) => {
    return this;
  };
}
