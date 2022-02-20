import { ColdFusionLogBase } from './cold-fusion-log-base.model';
import { LogType } from './log-type.enum';

export class ColdFusionInformationLog extends ColdFusionLogBase {
  constructor(public logType: LogType, public message: string) {
    super(logType, message);
  }
}
