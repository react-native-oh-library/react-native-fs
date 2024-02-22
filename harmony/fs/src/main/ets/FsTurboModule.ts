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
import fs from '@ohos.file.fs';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
import util from '@ohos.util';
import buffer from '@ohos.buffer';

let context = getContext(this) as common.ApplicationContext; // ApplicationContext

export class FsTurboModule extends TurboModule {
  // 常量路径
  getConstants(): object {
    return {
      // 沙箱路径
      FileSandBoxPath: context.filesDir,
      // 缓存路径
      FileCachePath: context.cacheDir,
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
      let file = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
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
}