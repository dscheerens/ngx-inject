import { Inject, Injectable, InjectionToken, Injector, NgModule, Optional, Provider } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EagerProviderLoaderService {

    private readonly loadedProviders = new Set<any>();

    public loadProviders(providers: Provider[], injector: Injector): void {
        providers
            .map((provider) => 'provide' in provider ? provider.provide : provider)
            .filter((providerToken) => !this.loadedProviders.has(providerToken))
            .forEach((providerToken) => {
                this.loadedProviders.add(providerToken);
                injector.get<any>(providerToken);
            });
    }

}

export const EAGER_PROVIDER = new InjectionToken<Provider>('EAGER_PROVIDER');

@NgModule()
export class EagerProviderLoaderModule {

    constructor(
        eagerProviderLoaderService: EagerProviderLoaderService,
        @Inject(EAGER_PROVIDER) @Optional() eagerProviders: Provider[],
        injector: Injector
    ) {
        eagerProviderLoaderService.loadProviders(eagerProviders || [], injector);
    }

}

export function eagerLoad(provider: Provider): Provider {
    return [
        provider,
        { provide: EAGER_PROVIDER, useValue: provider, multi: true }
    ];
}
