/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule, RNOHError } from 'rnoh/ts';
import fs, { ReadTextOptions, WriteOptions } from '@ohos.file.fs';
import hash from '@ohos.file.hash';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
import util from '@ohos.util';
import buffer from '@ohos.buffer';
import HashMap from '@ohos.util.HashMap';
import Logger from './Logger';

const TAG: string = "[RNOH] Fs"

interface StatResult {
  ctime: number, // The creation date of the file
  mtime: number, // The last modified date of the file
  size: number, // Size in bytes
  mode: number, // UNIX file mode
  originalFilepath: string, // ANDROID: In case of content uri this is the pointed file path, otherwise is the same as path
  type: number // Is the file just a file? Is the file a directory?
}

export class FsTurboModule extends TurboModule {

  context = getContext(this) as common.ApplicationContext; // ApplicationContext
  // 常量
  getConstants(): object {
    return {
      // 沙箱路径
      FileSandBoxPath: this.context.filesDir,
      // 缓存路径
      FileCachePath: this.context.cacheDir,
      // 文件
      RNFSFileTypeRegular: 0,
      // 文件夹
      RNFSFileTypeDirectory: 1,
    }
  };

  // 读取文件内容
  readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readText(path, (err: BusinessError, content: string) => {
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
      fs.access(path, (err: BusinessError, result: boolean) => {
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
      fs.mkdir(path, true, (err: BusinessError) => {
        if (err) {
          if (err.code == 13900015) {
            // 文件夹存在
            resolve();
          } else {
            reject(`Directory could not be created ${err.message} ${err.code}`);
          }
        } else {
          resolve();
        }
      })
    })
  }


  // 写入文件内容
  writeFile(path: string, contentStr: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // base64 decode 解码
      let result = buffer.from(contentStr, 'base64').toString('utf8');
      // 读写创建 文件不存在则创建文件
      let file = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
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
      // 读写创建 文件内容追加到末尾
      let file = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.APPEND);
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
      this.context.resourceManager.getRawFileContent(
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
      let fromResult: string[] = from.split('/');
      let intoResult: string[] = into.split('/');
      if (fromResult[fromResult.length-1] === intoResult[intoResult.length-1]) {
        reject(new Error('The file already exists.'));
        return;
      }
      fs.copyFile(from, into, (err: BusinessError) => {
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
      fs.rmdir(path, (err: BusinessError) => {
        if (err) {
          reject('FilePath does not exist');
        } else {
          resolve();
        }
      });
    })
  }

  // 文件hash
  hash(path: string, algorithm: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let algorithms: HashMap<string, string> = new HashMap();
      algorithms.set('md5', 'md5');
      algorithms.set('sha1', 'sha1');
      algorithms.set('sha256', 'sha256');
      // algorithm不存在
      if (!algorithms.hasKey(algorithm)) {
        reject('Invalid hash algorithm');
        return;
      }
      // 判断是否是文件夹
      let isDirectory = fs.statSync(path).isDirectory();
      if (isDirectory) {
        reject('file  IsDirectory');
        return;
      }
      // 判断文件是否在
      let res = fs.accessSync(path);
      if (!res) {
        reject('file not exists');
        return;
      }
      hash.hash(path, algorithm, (err: BusinessError, result: string) => {
        if (err) {
          reject("calculate file hash failed with error message: " + err.message + ", error code: " + err.code);
        } else {
          resolve(result);
        }
      })
    })
  }

  // 移动文件
  moveFile(filepath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.moveFile(filepath, destPath, 0, (err: BusinessError) => {
        if (err) {
          reject('move file failed with error message: ' + err.message + ', error code: ' + err.code);
        } else {
          resolve();
        }
      })
    })
  }

  // 文件内容部分读
  read(path: string, length: number, position: number): Promise<string> {
    return new Promise((resolve, reject) => {
      let readTextOption: ReadTextOptions = {
        offset: position,
        length: length,
        encoding: 'utf-8'
      };
      fs.readText(path, readTextOption, (err: BusinessError, str: string) => {
        if (err) {
          reject('readText failed with error message: ' + err.message + ', error code: ' + err.code);
        } else {
          let result = buffer.from(str, 'utf8').toString('base64');
          resolve(result);
        }
      });
    })
  }

  // 文件内容从某位置写
  write(filepath: string, contents: string, position: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let result = buffer.from(contents, 'base64').toString('utf8');
      let file = fs.openSync(filepath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      let writeOption: WriteOptions = {
        offset: position
      };
      fs.write(file.fd, result, writeOption, (err: BusinessError, writeLen: number) => {
        if (err) {
          reject('write data to file failed with error message:' + err.message + ', error code: ' + err.code);
        } else {
          resolve();
        }
        fs.closeSync(file);
      });
    })
  }

  touch(filePath: string, mtime?: number, ctime?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 判断是否是文件夹
      let isDirectory = fs.statSync(filePath).isDirectory();
      if (isDirectory) {
        reject('file IsDirectory');
        return;
      }
      // 判断文件是否在
      let res = fs.accessSync(filePath);
      if (!res) {
        reject('No such file or directory');
        return;
      }
      if (mtime) {
        try {
          fs.utimes(filePath, mtime);
          resolve(true)
        } catch (err) {
          resolve(err.message)
        }
      } else {
        resolve(false)
      }
    })
  }

  // 获取文件详细属性信息
  stat(filepath: string): Promise<StatResult> {
    return new Promise((resolve, reject) => {
      let statResult: StatResult = {
        ctime: -1,
        mtime: -1,
        size: -1,
        mode: -1,
        originalFilepath: '',
        type: -1
      };
      // 判断文件是否在
      let res = fs.accessSync(filepath);
      if (!res) {
        reject('file not exists');
        return;
      }
      fs.stat(filepath, (err: BusinessError, stat: fs.Stat) => {
        if (err) {
          Logger.error(TAG, `error message: ` + err.message + ', error code: ' + err.code);
        } else {
          statResult.ctime = stat.ctime;
          statResult.mtime = stat.mtime;
          statResult.size = stat.size;
          statResult.mode = stat.mode;
          statResult.originalFilepath = filepath;
          statResult.type = stat.isDirectory() ? 1 : 0;
          Logger.info(TAG, 'file statResult: ' + JSON.stringify(statResult));
          resolve(statResult);
        }
      });
    })
  }
}