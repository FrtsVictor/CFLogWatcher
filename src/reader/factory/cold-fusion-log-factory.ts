import { ColdFusionExceptionLog } from '../models/cold-fusion-exception-log.model';
import { ColdFusionInformationLog } from '../models/cold-fusion-information-log';
import { ColdFusionLogBase } from '../models/cold-fusion-log-base.model';
import { LogType } from '../models/log-type.enum';

export class ColdFusionLogFactory {
  public static create(logType: LogType, message: string): ColdFusionLogBase {
    switch (logType) {
      case LogType.EXCEPTION:
        return new ColdFusionExceptionLog(message);
      case LogType.REST_SERVICE:
      case LogType.MY_LOGS:
      case LogType.SERVER:
        return new ColdFusionInformationLog(logType, message);
      default:
        throw new Error('Check log type');
    }
  }
}
