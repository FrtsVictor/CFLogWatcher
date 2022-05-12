import { LogType } from './models/log-type.enum';

export interface IColdFusionLogReader {
  startReaderByErrorType(errorLogType: LogType, logColor: string): void;
}
