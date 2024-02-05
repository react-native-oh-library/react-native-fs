import { RNPackage, TurboModulesFactory } from 'rnoh/ts';
import type { TurboModule, TurboModuleContext } from 'rnoh/ts';
import { FsTurboModule } from './FsTurboModule';

class FsTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'ReactNativeFs') {
      // 上下文对象
      globalThis.uiAbilityContext = this.ctx.uiAbilityContext;
      return new FsTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'ReactNativeFs';
  }
}

export class FsPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new FsTurboModulesFactory(ctx);
  }
}
