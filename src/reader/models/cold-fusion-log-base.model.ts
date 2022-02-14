import { LogType } from './log-name.enum';

export abstract class ColdFusionLogBase {
  constructor(public logType: LogType, public message: string) {}
}
