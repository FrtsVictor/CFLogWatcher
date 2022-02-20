import events from 'events';
import fs from 'fs';
import readLine from 'readline';
import { PATTERNS, LOG_FILE_TYPE } from './consts';
import { ColdFusionExceptionLog } from './models/cold-fusion-exception-log.model';
import { LogType } from './models/log-type.enum';
import { getOsLogsDir } from './utils/os.util';
import { customLog } from './utils/custom-log';
import { LOG_COLORS } from './utils/log-colors';
import { IColdFusionLogReader } from './cold-fusion-log-reader.interface';
import { ColdFusionInformationLog } from './models/cold-fusion-information-log';
import { ColdFusionLogFactory } from './factory/cold-fusion-log-factory';

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
      const lastItem = logs[logs.length - 1];
      customLog(logColor, lastItem);

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
      const exceptionLog = ColdFusionLogFactory.create(LogType.EXCEPTION, line);
      logList.push(exceptionLog as ColdFusionExceptionLog);
    }

    if (this.#isCausedByLine(line)) logList[logList.length - 1].cause = line;
  }

  async #getInformationLogs(
    line: string,
    logList: ColdFusionInformationLog[],
    logType: LogType
  ) {
    if (this.#isLogMessage(line)) {
      const informationLog = ColdFusionLogFactory.create(logType, line);
      logList.push(informationLog);
    }
  }

  async #getLogs(
    logType: LogType
  ): Promise<ColdFusionExceptionLog[] | ColdFusionInformationLog[]> {
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
              this.#getInformationLogs(line, logList, logType);
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
