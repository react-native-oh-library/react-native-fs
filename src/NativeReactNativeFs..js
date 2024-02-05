
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type MkdirOptionsT = {
  // iOS-specific.
  NSURLIsExcludedFromBackupKey?: boolean;
};

export interface Spec extends TurboModule {
  getConstants: () => {
    // System paths. 沙箱路径
    FileSandBoxPath: string;
  };
  readFile(path: string): Promise<string>;

  exists(path: string): Promise<boolean>;

  mkdir(path: string, options?: MkdirOptionsT): Promise<void>;

  appendFile(path: string, contents: string, encoding?: string): Promise<void>;

  writeFile(path: string, contents: string, encoding?: string): Promise<void>;
  // Android-specific.
  readFileAssets(path: string): Promise<string>;

  copyFile(from: string, into: string): Promise<void>;

  unlink(filepath: string): Promise<void>
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeFs');
