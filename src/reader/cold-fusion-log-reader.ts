import events from 'events';
import fs from 'fs';
import readLine from 'readline';
import { PATTERNS, TOTAL_ERRORS, LOG_FILE_TYPE } from './consts';
import { ColdFusionExceptionLog } from './models/cold-fusion-exception-log.model';
import { LogType } from './models/log-name.enum';
import { getOsLogsDir } from './utils/os.util';
import { customLog } from './utils/custom-log';
import { LOG_COLORS } from './utils/log-colors';
import { IColdFusionLogReader } from './cold-fusion-log-reader.interface';
import { ColdFusionInformationLog } from './models/cold-fusion-information-log';
import { ColdFusionLogBase } from './models/cold-fusion-log-base.model';

export class ColdFusionLogReader implements IColdFusionLogReader {
  #readLine: readLine.Interface = null!;

  async startReaderByErrorType(errorLogType: LogType, logColor: string) {
    this.#executeWithTryCatch<void>(() =>
      this.#watchFile(errorLogType, logColor)
    );
  }

  #watchFile(errorLogType: LogType, logColor: string) {
    const logsDir = getOsLogsDir();
    const filePath = `${logsDir}${errorLogType}${LOG_FILE_TYPE}`;

    customLog(LOG_COLORS.text.yellow, `Watching file from: ${filePath}`);

    fs.watchFile(filePath, async () => {
      this.#createReadLineByFilePath(filePath);
      const logs = await this.#getLogs(errorLogType);
      customLog(logColor, logs[logs.length - 1]);

      await events.once(this.#readLine, 'close');
    });
  }

  #executeWithTryCatch<T>(callback: Function) {
    try {
      return callback();
    } catch (error) {
      console.warn(error);
      this.#closeReadLine();
    }
  }

  #isCausedByLine(line: string) {
    return line.startsWith(PATTERNS.CAUSED_BY_PATTERN);
  }

  #isLogMessage(val: string) {
    return (
      val.startsWith(PATTERNS.ERROR_MESSAGE_PATTERN) ||
      val.startsWith(PATTERNS.INFORMATION_PATTERN)
    );
  }

  #createReadLineByFilePath(exceptionLogPath: string): void {
    this.#readLine = readLine.createInterface({
      input: fs.createReadStream(exceptionLogPath)
    });
  }

  #closeReadLine() {
    this.#readLine.close();
    this.#readLine.removeAllListeners();
  }

  async #getExceptionLog(line: string, logList: ColdFusionExceptionLog[]) {
    if (this.#isLogMessage(line)) {
      const coldFusionExceptionLog = new ColdFusionExceptionLog(line, []);
      logList.push(coldFusionExceptionLog);
    }

    if (this.#isCausedByLine(line)) {
      const lastIndex = logList.length - 1;
      logList[lastIndex].cause.push(line);
    }
  }

  async #getInformationLogs(line: string, logList: ColdFusionInformationLog[]) {
    if (this.#isLogMessage(line)) {
      const coldFusionInformationLog = new ColdFusionInformationLog(
        LogType.REST_SERVICE,
        line
      );
      logList.push(coldFusionInformationLog);
    }
  }

  async #getLogs(logType: LogType): Promise<ColdFusionLogBase[]> {
    return new Promise((resolve, reject) => {
      const logList: ColdFusionExceptionLog[] | ColdFusionInformationLog = [];

      readLine;
      this.#readLine
        .on('line', (line) => {
          switch (logType) {
            case LogType.EXCEPTION:
              this.#getExceptionLog(line, logList);
            case LogType.REST_SERVICE:
            case LogType.SERVER:
              this.#getInformationLogs(line, logList);
          }
        })
        .on('close', () => {
          resolve(logList);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
