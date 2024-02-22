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

#include "FsTurboModule.h"
#include "RNOH/ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

static jsi::Value __hostFunction_FsTurboModule_getConstants(jsi::Runtime &rt, react::TurboModule &turboModule,
                                                              const jsi::Value *args, size_t count) {
    {
        return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getConstants", args, count));
    }
}

static jsi::Value __hostFunction_FsTurboModule_appendFile(jsi::Runtime &rt,
                                                                      react::TurboModule &turboModule,
                                                                      const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt,"appendFile",args, count);
}

static jsi::Value __hostFunction_FsTurboModule_copyFile(jsi::Runtime &rt,
                                                                    react::TurboModule &turboModule,
                                                                    const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "copyFile",args, count);
}

static jsi::Value __hostFunction_FsTurboModule_exists(jsi::Runtime &rt, react::TurboModule &turboModule,
                                                                  const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "exists",args,count);
}

static jsi::Value __hostFunction_FsTurboModule_mkdir(jsi::Runtime &rt, react::TurboModule &turboModule,
                                                                 const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "mkdir", args,count);
}


static jsi::Value __hostFunction_FsTurboModule_readFile(jsi::Runtime &rt,
                                                                    react::TurboModule &turboModule,
                                                                    const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "readFile",args, count);
}


static jsi::Value __hostFunction_FsTurboModule_writeFile(jsi::Runtime &rt,
                                                                     react::TurboModule &turboModule,
                                                                     const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "writeFile",args, count);
}


static jsi::Value __hostFunction_FsTurboModule_readFileAssets(jsi::Runtime &rt,
                                                                          react::TurboModule &turboModule,
                                                                          const jsi::Value *args,
                                                                          size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "readFileAssets", args, count);
}

static jsi::Value __hostFunction_NativeFsSpecJSI_unlink(jsi::Runtime &rt, react::TurboModule &turboModule,
                                                        const jsi::Value *args, size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "unlink", args, count);
}

FsTurboModule::FsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
    methodMap_["getConstants"] = MethodMetadata{0, __hostFunction_FsTurboModule_getConstants};
    methodMap_["readFile"] = MethodMetadata{1, __hostFunction_FsTurboModule_readFile};
    methodMap_["exists"] = MethodMetadata{1, __hostFunction_FsTurboModule_exists};
    methodMap_["mkdir"] = MethodMetadata{2, __hostFunction_FsTurboModule_mkdir};
    methodMap_["appendFile"] = MethodMetadata{2, __hostFunction_FsTurboModule_appendFile};
    methodMap_["writeFile"] = MethodMetadata{2, __hostFunction_FsTurboModule_writeFile};
    methodMap_["readFileAssets"] = MethodMetadata{1, __hostFunction_FsTurboModule_readFileAssets};
    methodMap_["copyFile"] = MethodMetadata{2, __hostFunction_FsTurboModule_copyFile};
    methodMap_["unlink"] = MethodMetadata{1, __hostFunction_NativeFsSpecJSI_unlink};
}
