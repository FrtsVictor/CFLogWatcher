import os from 'os';
import { WINDOWS_LOG_PATH, WSL_LOG_PATH } from '../consts';

export const getOsLogsDir = (): string => {
  const osType = os.type();
  switch (osType) {
    case 'Windows_NT':
      return WINDOWS_LOG_PATH;
    case 'Linux':
      return WSL_LOG_PATH;
    default:
      throw new Error('Operation system file path not configured');
  }
};
