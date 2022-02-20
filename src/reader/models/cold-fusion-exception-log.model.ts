import { ColdFusionLogBase } from './cold-fusion-log-base.model';
import { LogType } from './log-type.enum';

export class ColdFusionExceptionLog extends ColdFusionLogBase {
  constructor(public message: string, public cause?: string) {
    super(LogType.EXCEPTION, message);
  }

  protected toString(): string {
    return `${super.toString()}${this.cause}\r\n`;
  }
}
