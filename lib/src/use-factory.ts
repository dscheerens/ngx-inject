import { Inject, Optional, ProviderToken, SkipSelf } from '@angular/core';

import { UnboundFactoryProvider } from './provider-binding';

// tslint:disable-next-line:no-any
type Dependencies<T extends (...args: any) => any> = T extends (...args: infer P) => any
    ? { [K in keyof P]: ProviderToken<P[K]> | [...(Optional | SkipSelf)[], ProviderToken<P[K]> | Inject] }
    : never;

// tslint:disable-next-line:no-any
export function useFactory<F extends (...args: any) => any>(
    factoryFn: F,
    ...dependencies: Dependencies<F>
): UnboundFactoryProvider<ReturnType<F>> {
    return {
        useFactory: factoryFn,
        deps: dependencies,
    };
}
