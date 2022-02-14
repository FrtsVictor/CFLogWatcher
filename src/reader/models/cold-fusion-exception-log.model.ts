import { ColdFusionLogBase } from './cold-fusion-log-base.model';
import { LogType } from './log-name.enum';

export class ColdFusionExceptionLog extends ColdFusionLogBase {
  constructor(public message: string, public cause: string[]) {
    super(LogType.EXCEPTION, message);
  }
}
