import { LOG_COLORS } from './reader/utils/log-colors';
import { LogType } from './reader/models/log-type.enum';
import { customLog } from './reader/utils/custom-log';
import { ColdFusionLogReader } from './reader';

(async () => {
  await new ColdFusionLogReader().startReaderByErrorType(
    LogType.EXCEPTION,
    LOG_COLORS.text.red
  );

  await new ColdFusionLogReader().startReaderByErrorType(
    LogType.MY_LOGS,
    LOG_COLORS.text.red
  );

  await new ColdFusionLogReader().startReaderByErrorType(
    LogType.REST_SERVICE,
    LOG_COLORS.text.yellow
  );

  await new ColdFusionLogReader().startReaderByErrorType(
    LogType.SERVER,
    LOG_COLORS.text.green
  );
  customLog(LOG_COLORS.text.cyan, 'App Running');
})();
