#include "RNOH/Package.h"
#include "FsTurboModule.h"

using namespace rnoh;
using namespace facebook;

class NativeRTNFsFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
      if (name == "ReactNativeFs") {
          return std::make_shared<FsTurboModule>(ctx, name);
      }
      return nullptr;
    }
};

namespace rnoh {

class FsPackage : public Package {
  public:
    FsPackage(Package::Context ctx) : Package(ctx) {}
    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<NativeRTNFsFactoryDelegate>();
    }
};
} // namespace rnoh
