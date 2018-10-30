import { Inject, Injectable, InjectionToken, Injector, NgModule, Optional, Provider } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EagerProviderLoaderService {

    private readonly loadedProviders = new Set<any>();

    public loadProviders(providerTokens: any[], injector: Injector): void {
        providerTokens
            .filter((providerToken) => !this.loadedProviders.has(providerToken))
            .forEach((providerToken) => {
                this.loadedProviders.add(providerToken);
                injector.get(providerToken);
            });
    }

}

export const EAGER_PROVIDER = new InjectionToken<any>('EAGER_PROVIDER');

@NgModule()
export class EagerProviderLoaderModule {

    constructor(
        eagerProviderLoaderService: EagerProviderLoaderService,
        @Inject(EAGER_PROVIDER) @Optional() eagerProviderTokens: any[],
        injector: Injector
    ) {
        eagerProviderLoaderService.loadProviders(eagerProviderTokens || [], injector);
    }

}

export function eagerLoad(provider: Provider): Provider {
    return [
        provider,
        {
            provide: EAGER_PROVIDER,
            useValue: (provider as any).provide || provider,
            multi: true
        }

    ]
}
