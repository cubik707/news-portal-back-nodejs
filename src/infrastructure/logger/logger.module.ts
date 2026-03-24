import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env['LOG_LEVEL'] ?? (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        serializers: {
          responseTime: (value: number) => `${value}ms`,
        },
        customSuccessMessage: (req: IncomingMessage, res: ServerResponse, responseTime: number) =>
          `${req.method ?? 'GET'} ${req.url ?? ''} ${res.statusCode} ${responseTime}ms`,
        customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) =>
          `${req.method ?? 'GET'} ${req.url ?? ''} ${res.statusCode} - ${err.message}`,
        autoLogging: true,
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
