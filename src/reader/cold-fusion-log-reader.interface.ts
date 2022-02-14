import { LogType } from './models/log-name.enum';

export interface IColdFusionLogReader {
  startReaderByErrorType(errorLogType: LogType, logColor: string): void;
}
