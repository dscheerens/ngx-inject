[![Build Status](https://api.travis-ci.org/dscheerens/ngx-inject.svg?branch=master)](https://travis-ci.org/dscheerens/ngx-inject) [![NPM Version](https://img.shields.io/npm/v/ngx-inject.svg)](https://www.npmjs.com/package/ngx-inject)

# `ngx-inject` - dependency injection utilities for Angular

This package provides a variety of utility functions and types related to Angular's dependency injection framework.
It ships with the following features:

* [Provider binding](#provider-binding)

## Installation and usage

Add the module to your `package.json` file:

```
npm install --save ngx-inject
```

After having installed the `ngx-inject` package you might need to update your project configuration depending on the build tools you use, e.g. _SystemJS_ or _Karma_.
The `ngx-inject` package is published in the [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview).

Once the dependency has been installed and your build tooling configuration has been updated (if necessary), you can start using the library by importing the features you need.
The following sections describe how to import and use these features.

## Provider binding

The provider binding feature from `ngx-inject` lets you separate the definition of providers in the what and how: which token vs how should a value for injection be obtained for that token.
This separation is made possible by introducing the concept of an _unbound provider_: a provider definition without a `provide` property.

An unbound provider is represented using the `UnboundProvider<T>` type which has a type argument `T` that determines the type of the value that is obtained by the provider.
To convert an unbound provider into a full provider that can be used by Angular's dependency injection framework it has to be bound to a token.
This is done using the `bindProvider` function which takes a token and an unbound provider as arguments and combines them to yield a [`Provider`](https://angular.io/api/core/Provider) instance.

> The `bindProvider` function is compatible with Angular's AOT compiler, so it can safely be used without running into _function calls are not supported_ errors or injected dependencies being `undefined` at runtime.

Together with the `bindProvider` function the unbound provider concept offers a nice method for modules to specify dependencies that need to be provided outside of the module (e.g. configuration) in a typesafe manner.
One way of defining these dependencies is by creating a static function in your module that returns a `ModuleWithProviders` object.
This is illustrated in the following example:

```typescript
import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { UnboundProvider, bindProvider } from 'nxg-inject';

export interface MyConfig {
    importantData: string;
}

export const MY_CONFIG = new InjectionToken<MyConfig>('MY_CONFIG');

export class MyService {
    constructor(
        @Inject(MY_CONFIG) private config: MyConfig
    ) { }
}

@NgModule({
    providers: [
        MyService
    ]
})
export class MyModule {
    public static withConfiguration(config: UnboundProvider<MyConfig>): ModuleWithProviders {
        return {
            ngModule: MyModule,
            providers: [
                bindProvider(MY_CONFIG, config) // Module consumer specifies how to resolve the config
            ]
        };
    }
}
```

As can be seen from this example: a consumer of `MyModule` has to specify how to resolve a value for an instance of `MyConfig`, while the the module itself takes care of binding it to the correct token (so it will later be available for injection in the `MyService` constructor).
This construct makes it explicit what dependencies (in the form of providers) are needed by a module, without consumers having to know exactly which tokens need to be provided.
Also, since the `bindProvider` function and `UnboundProvider` model are fully typesafe a consumer cannot make the mistake of providing a value of an incorrect type.

```Typescript
MyModule.withConfiguration({ useValue: 5 }); // <-- TYPE ERROR!
MyModule.withConfiguration({ useValue: { importantData: 'hmmm pie!' }); // OK :)
```

## Provider binding API

Unbound providers can be specified using one of the following flavors:

* `UnboundValueProvider` - Uses the value of the `useValue` field for injection.

  **Model Definition:** `UnboundValueProvider<T> { useValue: T }`

* `UnboundClassProvider` - Creates an instance of the specified class as injection value.

  **Model Definition:** `UnboundClassProvider<T> { useClass: Type<T>;}`

* `UnboundExistingProvider` - Reuses another provider, which is referenced using the specified token, to resolve the value that will be used for injection.

  **Model Definition:** `UnboundExistingProvider<T> { useExisting: Token<T> }`

  The `useExisting` field can either be an instance of Angular's [`InjectionToken`](https://angular.io/api/core/InjectionToken) class or a direct reference to a class (abstract classes are supported as well).

* `UnboundFactoryProvider` - Uses the specified factory function to create an injection value.

  **Model Definition:** `UnboundFactoryProvider<T> { useFactory(...deps: any[]): T; deps?: any[] }`

  The factory function can take an arbitrary number of parameters.
  It is invoked with resolved values of tokens in the `deps` field.

Typically you do not need to use one of these specific types for an unbound provider.
Instead you should use the broader `UnboundProvider<T>` type, which is simply the type union of all of the above types.

**`bindProvider` function**

Signature:

```typescript
function bindProvider<T, U extends T>(
    token: Token<T>,
    unboundProvider: UnboundProvider<U> | undefined,
    options: {
        multi?: boolean;
        default?: UnboundProvider<U>;
    } = {}
): Provider;
```

Parameters:

* `token` - Token which for which the provider is to be defined.
  This can either be an instance of Angular's [`InjectionToken`](https://angular.io/api/core/InjectionToken) class or a direct reference to an (abstract) class.
* `unboundProvider` - Definition of a provider which should be bound to the specified token.
  This should be unbound provider that yields a value of type `T` or subtype of `T`.
  Another valid argument value for this parameter is `undefined`.
  If a default provider (`options.default`) is specified, then that provider will be used instead.
  When this is not the case, the `bindProvider` function returns an empty array, which is a valid Angular provider value to represent _nothing_.
* `options` - Extra binding options.
  This is an optional parameter.
* `options.multi` - Whether the provider should be contribute to a "multi-provider" (resulting an array of instances when injected).
* `options.default` - Default provider definition to use when the argument value of the `unboundProvider` parameter is `undefined`.

Return value:

A value that conforms to Angular's [`Provider`](https://angular.io/api/core/Provider) type, which can be used in the providers list of module metadata.
