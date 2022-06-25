import { Provider, ProviderToken, Type } from '@angular/core';

/** Definition (without token binding) for providers that will create a singleton instance of the specified class for injection. */
export type UnboundTypeProvider<T> = Type<T>;

/** Definition (without token binding) for providers that use the specified value for injection. */
export interface UnboundValueProvider<T> {
    /** The value to inject. */
    useValue: T;
}

/** Definition (without token binding) for providers that instantiate a specific class for injection. */
export interface UnboundClassProvider<T> {
    /** Class to instantiate when being injected for a specific token. */
    useClass: Type<T>;
}

/** Definition (without token binding) for providers that reference another token to use for injection. */
export interface UnboundExistingProvider<T> {
    /** Existing token to return (equivalent to `injector.get(useExisting)`). */
    useExisting: ProviderToken<T>;
}

type ArgsToDeps<T> = {
    [K in keyof T]: ProviderToken<T[K]>
};

/** Definition (without token binding) for providers that use a factory function to create injection values. */
export interface UnboundFactoryProvider<T, D extends unknown[]> {
    /**
     * A function to invoke to create a value when this provider is injected for a specific token. The function is invoked with resolved
     * values of tokens in the `deps` field.
     */
    useFactory: (...deps: D) => T;  // tslint:disable-line:prefer-method-signature

    /**
     * A list of tokens which need to be resolved by the injector. The list of values is then used as arguments to the `useFactory`
     * function.
     */
    deps: ArgsToDeps<D>;
}

export interface UnboundNoArgsFactoryProvider<T> {
    useFactory: () => T;    // tslint:disable-line:prefer-method-signature
}

/**
 * Typesafe representation for provider definitions which are not bound to a specific token (i.e. a definition wihtout `provide` property).
 */
export type UnboundProvider<T, D extends unknown[] = any[]> = // tslint:disable-line:no-any // default to any[] for backwards compatibility
    UnboundTypeProvider<T> |
    UnboundValueProvider<T> |
    UnboundClassProvider<T> |
    UnboundExistingProvider<T> |
    UnboundNoArgsFactoryProvider<T> |
    UnboundFactoryProvider<T, D>;

/** Extra binding options for the `bindProvider` function. */
export interface BindProviderOptions<U, D extends unknown[]> {
    /** Whether the provider should be contribute to a "multi-provider" (resulting an array of instances when injected). */
    multi?: boolean;

    /** Default provider definition to use when the provider definition passed to the `bindProvider` function is `undefined`. */
    default?: UnboundProvider<U, D>;
}

/**
 * Binds the given provider definition to the specified token and returns a `Provider` entry that can be used in the providers list of
 * Angular module definitions.
 *
 * @param token           Token which for which the provider is to be defined.
 * @param unboundProvider Definition of a provider which should be bound to the specified token.
 * @param options         Optional extra binding options.
 */
export function bindProvider<T, U extends T>(
    token: ProviderToken<T>,
    unboundProvider: UnboundProvider<U, unknown[]> | undefined,
    options: BindProviderOptions<U, unknown[]> = {},
): Provider {
    return (
        unboundProvider ? (
            (unboundProvider as { apply?: unknown }).apply ?
                [
                    unboundProvider,
                    {
                        provide: token,
                        useExisting: unboundProvider as UnboundTypeProvider<U>,
                        multi: options.multi,
                    },
                ] :
            (unboundProvider as UnboundValueProvider<U>).useValue ?
                {
                    provide: token,
                    useValue: (unboundProvider as UnboundValueProvider<U>).useValue,
                    multi: options.multi,
                } :
            (unboundProvider as UnboundClassProvider<U>).useClass ?
                {
                    provide: token,
                    useClass: (unboundProvider as UnboundClassProvider<U>).useClass,
                    multi: options.multi,
                } :
            (unboundProvider as UnboundExistingProvider<U>).useExisting ?
                {
                    provide: token,
                    useExisting: (unboundProvider as UnboundExistingProvider<U>).useExisting,
                    multi: options.multi,
                } :
            (unboundProvider as UnboundFactoryProvider<U, unknown[]>).useFactory ?
                {
                    provide: token,
                    useFactory: (unboundProvider as UnboundFactoryProvider<U, unknown[]>).useFactory,
                    deps: (unboundProvider as UnboundFactoryProvider<U, unknown[]>).deps,
                    multi: options.multi,
                } :
            []
        ) :
        options.default ? (
            (options.default as { apply?: unknown }).apply  ?
                [
                    options.default,
                    {
                        provide: token,
                        useExisting: options.default as UnboundTypeProvider<U>,
                        multi: options.multi,
                    },
                ] :
            (options.default as UnboundValueProvider<U>).useValue ?
                {
                    provide: token,
                    useValue: (options.default as UnboundValueProvider<U>).useValue,
                    multi: options.multi,
                } :
            (options.default as UnboundClassProvider<U>).useClass ?
                {
                    provide: token,
                    useClass: (options.default as UnboundClassProvider<U>).useClass,
                    multi: options.multi,
                } :
            (options.default as UnboundExistingProvider<U>).useExisting ?
                {
                    provide: token,
                    useExisting: (options.default as UnboundExistingProvider<U>).useExisting,
                    multi: options.multi,
                } :
            (options.default as UnboundFactoryProvider<U, unknown[]>).useFactory ?
                {
                    provide: token,
                    useFactory: (options.default as UnboundFactoryProvider<U, unknown[]>).useFactory,
                    deps: (options.default as UnboundFactoryProvider<U, unknown[]>).deps,
                    multi: options.multi,
                } :
            []
        ) :
        []
    );
}
