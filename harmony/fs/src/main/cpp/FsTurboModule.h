// NOTE: This entire file should be codegen'ed.
#pragma once
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT FsTurboModule : public ArkTSTurboModule {
public:
    FsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh
