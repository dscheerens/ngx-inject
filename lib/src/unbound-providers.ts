import { InjectionToken, Provider, Type } from '@angular/core';

export type InjectableType<T> = Function & { prototype: T }; // tslint:disable-line:ban-types

export type Token<T> = InjectableType<T> | InjectionToken<T>;

export interface UnboundValueProvider<T> {
    useValue: T;
}

export interface UnboundClassProvider<T> {
    useClass: Type<T>;
}

export interface UnboundExistingProvider<T> {
    useExisting: Token<T>;
}

export interface UnboundFactoryProvider<T> {
    deps?: any[];
    useFactory(...deps: any[]): T;
}

export type UnboundProvider<T> = UnboundValueProvider<T> | UnboundClassProvider<T> | UnboundExistingProvider<T> | UnboundFactoryProvider<T>;

export function bindProvider<T, U extends T>(
    token: Token<T>,
    unboundProvider: UnboundProvider<U>,
    options: { multi?: boolean } = {}
): Provider {
    return (
        (unboundProvider as UnboundValueProvider<U>).useValue ?
            {
                provide: token,
                useValue: (unboundProvider as UnboundValueProvider<U>).useValue,
                multi: options.multi
            } :
        (unboundProvider as UnboundClassProvider<U>).useClass ?
            {
                provide: token,
                useClass: (unboundProvider as UnboundClassProvider<U>).useClass,
                multi: options.multi
            } :
        (unboundProvider as UnboundExistingProvider<U>).useExisting ?
            {
                provide: token,
                useExisting: (unboundProvider as UnboundExistingProvider<U>).useExisting,
                multi: options.multi
            } :
        (unboundProvider as UnboundFactoryProvider<U>).useFactory ?
            {
                provide: token,
                useFactory: (unboundProvider as UnboundFactoryProvider<U>).useFactory, // tslint:disable-line:no-unbound-method
                deps: (unboundProvider as UnboundFactoryProvider<U>).deps,
                multi: options.multi
            } :
        []
    );
}
