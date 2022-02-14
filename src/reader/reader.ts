import events from 'events';
import fs from 'fs';
import readLine from 'readline';
import { PATTERNS, TOTAL_ERRORS, LOG_FILE_TYPE } from './consts';
import { CFusionLog } from './models/error.model';
import { LogType } from './models/log-name.enum';
import { getOsLogsDir } from './utils/os.util';
import { customLog } from './utils/custom-log';
import { LOG_COLORS } from './utils/log-colors';

const isCausedByLine = (line: string) =>
  line.startsWith(PATTERNS.CAUSED_BY_PATTERN);

const isErrorOrInformationLine = (val: string) =>
  val.startsWith(PATTERNS.ERROR_MESSAGE_PATTERN) ||
  val.startsWith(PATTERNS.INFORMATION_PATTERN);

const isTotalErrors = (wantedErrors: CFusionLog[]) =>
  wantedErrors.length === TOTAL_ERRORS;

export const createReadLine = (exceptionLogPath: string): readLine.Interface =>
  readLine.createInterface({
    input: fs.createReadStream(exceptionLogPath)
  });

const closeReadLine = (readLine: readLine.Interface) => {
  readLine.close();
  readLine.removeAllListeners();
};

const getLogs = async (
  readLine: readLine.Interface,
  errorLogType: LogType
): Promise<CFusionLog[]> => {
  return new Promise((resolve, reject) => {
    const errorList: CFusionLog[] = [];

    readLine
      .on('line', (line) => {
        if (isErrorOrInformationLine(line)) {
          const cfError: CFusionLog = {
            logType: errorLogType,
            message: line
          };
          errorList.push(cfError);
        }

        if (isCausedByLine(line)) {
          const lastIndex = errorList.length - 1;
          errorList[lastIndex].cause = errorList[lastIndex].cause ?? line;
        }
      })
      .on('close', () => {
        resolve(errorList);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

export const startReaderByErrorType = async (
  errorLogType: LogType,
  logColor: string
) => {
  try {
    const logsDir = getOsLogsDir();
    const filePath = `${logsDir}${errorLogType}${LOG_FILE_TYPE}`;

    customLog(LOG_COLORS.text.yellow, `....Starting logs for: ${filePath}`);

    fs.watchFile(filePath, async () => {
      const readLine = createReadLine(filePath);
      const logs = await getLogs(readLine, errorLogType);
      customLog(logColor, logs[logs.length - 1]);

      await events.once(readLine, 'close');
    });
  } catch (err) {
    console.warn(err);
  }
};
