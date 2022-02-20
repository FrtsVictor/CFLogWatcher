import { PATTERNS } from '../consts';
import { LogType } from './log-type.enum';

export abstract class ColdFusionLogBase {
  constructor(public logType: LogType, public message: string) {}

  protected toString() {
    return `LogType: ${this.logType}\r\nMessage: ${this.message}\r\n`;
  }

  protected isLogMessage(val: string) {
    return (
      val.startsWith(PATTERNS.ERROR_MESSAGE_PATTERN) ||
      val.startsWith(PATTERNS.INFORMATION_PATTERN)
    );
  }
}
