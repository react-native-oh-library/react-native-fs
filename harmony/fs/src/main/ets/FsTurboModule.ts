import { TurboModule, RNOHError } from 'rnoh/ts';
import fs from '@ohos.file.fs';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
import util from '@ohos.util';
import buffer from '@ohos.buffer';
import HashMap from '@ohos.util.HashMap';

let context = getContext(this) as common.ApplicationContext; // ApplicationContext
// 沙箱路径
let pathDir = context.filesDir


export class FsTurboModule extends TurboModule {
  // 常量路径
  getConstants(): object {
    // 沙箱路径
    return {
      FileSandBoxPath: context.filesDir,
    }
  };

  // 读取文件内容
  readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readText((pathDir + '/' + path), (err: BusinessError, content: string) => {
        if (err) {
          reject('Failed to read the file');
        } else {
          let result = buffer.from(content, 'utf8').toString('base64');
          resolve(result);
        }
      });
    })
  };

  // 判断文件是否存在
  exists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access((pathDir + '/' + path), (err: BusinessError, result: boolean) => {
        if (err) {
          reject('File does not exist');
        } else {
          resolve(result);
        }
      });
    })
  };

  // 创建文件
  mkdir(path: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let result: string[] = path.split('/');
      let mkdirPath = pathDir;
      for (let i = 0; i < result.length; i++) {
        mkdirPath += '/' + result[i];
        let access = await fs.access(mkdirPath);
        if (!access) {
          fs.mkdir(mkdirPath, (err: BusinessError) => {
            if (err) {
              reject('Directory could not be created: ' + result[i]);
            } else {
              resolve();
            }
          });
        }
      }
    })
  };

  // 写入文件内容
  writeFile(path: string, contentStr: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // base64 decode 解码
      let result = buffer.from(contentStr, 'base64').toString('utf8');
      // 文件路径
      let filePath = pathDir + '/' + path;
      // 读写创建 文件不存在则创建文件
      let file = fs.openSync(filePath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      fs.write(file.fd, result, (err: BusinessError, writeLen: number) => {
        if (err) {
          reject('Directory could not be created');
        } else {
          resolve();
        }
        fs.closeSync(file);
      });
    })
  };

  // 文件内容追加
  appendFile(path: string, contentStr: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // base64 decode 解码
      let result = buffer.from(contentStr, 'base64').toString('utf8');
      // 文件路径
      let filePath = pathDir + '/' + path;
      // 读写创建 文件内容追加到末尾
      let file = fs.openSync(filePath, fs.OpenMode.READ_WRITE | fs.OpenMode.APPEND);
      fs.write(file.fd, result, (err: BusinessError, writeLen: number) => {
        if (err) {
          reject('Directory could not be created');
        } else {
          resolve();
        }
        fs.closeSync(file);
      });
    })
  };

  // 资源文件内容读取
  readFileAssets(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      context.resourceManager.getRawFileContent(
        path, (err: BusinessError, value) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(this.parsingRawFile(value));
        }
      });
    })
  }

  private parsingRawFile(rawFile: Uint8Array): string {
    let base64 = new util.Base64Helper();
    let result = base64.encodeToStringSync(rawFile);
    return result;
  }

  // 将位于from的文件复制到into。
  copyFile(from: string, into: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 文件路径
      let filePath = pathDir + '/' + from;
      let destPath = pathDir + '/' + into;
      let fromResult: string[] = filePath.split('/');
      let intoResult: string[] = destPath.split('/');
      if (fromResult[fromResult.length-1] === intoResult[intoResult.length-1]) {
        reject(new Error('The file already exists.'));
        return;
      }
      fs.copyFile(filePath, destPath, (err: BusinessError) => {
        if (err) {
          reject(err.message);
        } else {
          resolve();
        }
      })
    })
  };

  // 删除文件
  unlink(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 文件路径
      let filePath = pathDir + '/' + path;
      fs.rmdir(filePath, (err: BusinessError) => {
        if (err) {
          reject('FilePath does not exist');
        } else {
          resolve();
        }
      });
    })
  }
}