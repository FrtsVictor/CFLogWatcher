import { LogType } from './log-name.enum';

export class CFusionLog {
  constructor(
    public logType: LogType,
    public message: string,
    public cause?: string[]
  ) {}
}
