
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type MkdirOptionsT = {
  // iOS-specific.
  NSURLIsExcludedFromBackupKey?: boolean;
};

type StatResult = {    
  ctime: number;     // The creation date of the file
  mtime: number;     // The last modified date of the file
  size: number;     // Size in bytes
  mode: number;     // UNIX file mode
  originalFilepath: string;    // ANDROID: In case of content uri this is the pointed file path, otherwise is the same as path
  type: number       // Is the file just a file? // Is the file a directory?  
};

type DownloadResult = {
  jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  statusCode: number;     // The HTTP status code
  bytesWritten: number;   // The number of bytes written to the file
};

export interface Spec extends TurboModule {
  getConstants(): Object;

  readFile(path: string): Promise<string>;

  exists(path: string): Promise<boolean>;

  mkdir(path: string, options?: MkdirOptionsT): Promise<void>;

  appendFile(path: string, contents: string, encoding?: string): Promise<void>;

  writeFile(path: string, contents: string, encoding?: string): Promise<void>;
  // Android-specific.
  readFileAssets(path: string): Promise<string>;

  copyFile(from: string, into: string): Promise<void>;

  unlink(filepath: string): Promise<void>;

  hash(filepath: string, algorithm: string): Promise<string>;

  moveFile(filepath: string, destPath: string): Promise<void>;

  read(path: string, length: number, position: number): Promise<string>;

  write(filepath: string, contents: string, position: number): Promise<void>;

  stat(filepath: string): Promise<StatResult>;

  touch(filepath: string, mtime?: number, ctime?: number): Promise<boolean>;

  downloadFile(bridgeOptions: Object): Promise<DownloadResult>;

  readDir(dirpath: string): Promise<Object[]>;

  existsAssets(filepath: string):Promise<boolean>;

  addListener(eventName: string): void;

  removeListeners(count: number): void;

}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeFs');
