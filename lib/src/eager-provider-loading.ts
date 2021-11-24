import { Inject, Injectable, InjectionToken, Injector, ModuleWithProviders, NgModule, Optional, Provider } from '@angular/core';

import { Token } from './token.model';

/**
 * Singleton service which takes care of the actual eager loading of providers.
 */
@Injectable({ providedIn: 'root' })
export class EagerProviderLoaderService {

    private readonly loadedProviders = new Set<unknown>();

    /**
     * Loads the specified providers by requesting them via the specified injector (which forces them to load). If a provider has already
     * been loaded (based on the token of that provider) then it will be ignored. This only affects providers that have been marked for
     * eager loading in lazy loaded modules.
     *
     * @param providers The providers which should be forced to load.
     * @param injector  Injector which is responsible for the loading of the providers.
     */
    public loadProviders(providers: Provider[], injector: Injector): void {
        extractProviderTokens(providers)
            .filter((providerToken) => !this.loadedProviders.has(providerToken))
            .forEach((providerToken) => {
                this.loadedProviders.add(providerToken);
                injector.get(providerToken);
            });
    }

}

/**
 * Extracts the tokens to which the specified provider is bound. The function recursively checks for arrays of providers (since an array
 * is also a valid `Provider`). Hence the result of this function is not a single token, but an array of tokens instead.
 *
 * @param   provider The provider (or an array of providers) for which the dependency injection tokens need to be extracted.
 * @returns          An array of dependency injection tokens for the specified provider(s).
 */
function extractProviderTokens(provider: Provider): Token<unknown>[] {
    if (Array.isArray(provider)) {
        return provider.reduce((result, p) => [...result, ...extractProviderTokens(p)], []);
    }

    if ('provide' in provider) {
        return [ provider.provide ];
    }

    return [ provider ];
}

/** Injection token used for registering providers which should be eagerly loaded (via the `EagerProviderLoaderModule`) */
export const EAGER_PROVIDER = new InjectionToken<Provider>('EAGER_PROVIDER');

/**
 * Module that takes care of automatically loading providers (on application startup) that have been marked for eager loading (using the
 * `eagerLoad` function).
 *
 * Import this module in the root module (usually called `AppModule`) of your application.
 */
@NgModule()
export class EagerProviderLoaderModule {

    constructor(
        eagerProviderLoaderService: EagerProviderLoaderService,
        @Inject(EAGER_PROVIDER) @Optional() eagerProviders: Provider[],
        injector: Injector,
    ) {
        eagerProviderLoaderService.loadProviders(eagerProviders || [], injector);
    }

    /**
     * Convenience function that offers a shorter way of importing both the `EagerProviderLoaderModule` and registering one or more eager
     * loaded providers at the same time.
     *
     * @param   provider Provider (or an array of providers) which should be eagerly loaded.
     * @returns          A `ModuleWithProviders` definition for the `EagerProviderLoaderModule` and the specified provider(s) which are
     *                   also setup for eager loading.
     */
    public static for(provider: Provider): ModuleWithProviders<EagerProviderLoaderModule> {
        return {
            ngModule: EagerProviderLoaderModule,
            providers: [
                eagerLoad(provider),
            ],
        };

    }

}

/**
 * Marks the specified provider for eager loading, meaning it will be loaded on application startup.
 *
 * The result of this function is a new provider that contains both the original provider and an additional provider that holds the eager
 * loading marker. For this to work you have to make sure that the `EagerProviderLoaderModule` is imported in your application's root
 * module.
 *
 * @param   provider The provider which should be eagerly loaded. This can also be an array of providers.
 * @returns          A new provider that can be used in module metadata instead of the specified original provider.
 */
export function eagerLoad(provider: Provider): Provider {
    return [
        provider,
        { provide: EAGER_PROVIDER, useValue: provider, multi: true },
    ];
}
