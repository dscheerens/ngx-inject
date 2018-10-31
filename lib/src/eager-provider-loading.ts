import { Inject, Injectable, InjectionToken, Injector, ModuleWithProviders, NgModule, Optional, Provider } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EagerProviderLoaderService {

    private readonly loadedProviders = new Set<any>();

    public loadProviders(providers: Provider[], injector: Injector): void {
        extractProviderTokens(providers)
            .filter((providerToken) => !this.loadedProviders.has(providerToken))
            .forEach((providerToken) => {
                this.loadedProviders.add(providerToken);
                injector.get<any>(providerToken);
            });
    }

}

function extractProviderTokens(provider: Provider): any[] {
    if (Array.isArray(provider)) {
        return provider.reduce((result, p) => [...result, ...extractProviderTokens(p)], []);
    } else if ('provide' in provider) {
        return [ provider.provide ];
    } else {
        return [ provider ];
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

    public static for(provider: Provider): ModuleWithProviders {
        return {
            ngModule: EagerProviderLoaderModule,
            providers: [
                eagerLoad(provider)
            ]
        };

    }

}

export function eagerLoad(provider: Provider): Provider {
    return [
        provider,
        { provide: EAGER_PROVIDER, useValue: provider, multi: true }
    ];
}
