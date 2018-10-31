[![Build Status](https://api.travis-ci.org/dscheerens/ngx-inject.svg?branch=master)](https://travis-ci.org/dscheerens/ngx-inject) [![NPM Version](https://img.shields.io/npm/v/ngx-inject.svg)](https://www.npmjs.com/package/ngx-inject)

# `ngx-inject` - dependency injection utilities for Angular

This package provides a variety of utility functions and types related to Angular's dependency injection framework.
It ships with the following features:

* [Provider binding](#provider-binding)
* [Eager provider loading](#eager-provider-loading)

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

> The `bindProvider` function is compatible with Angular's AoT compiler, so it can safely be used without running into _function calls are not supported_ errors or injected dependencies being `undefined` at runtime.

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

```typescript
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

### `bindProvider` function

**Signature:**

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

**Parameters:**

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

**Return value:**

A value that conforms to Angular's [`Provider`](https://angular.io/api/core/Provider) type, which can be used in the providers list of module metadata.

## Eager provider loading

This feature enables your application to eager load providers if necessary.
By default Angular loads all providers in a lazy manner, i.e. only whenever other components or services that are instantiated (via Angular's dependency injection framework) require them as a dependency.
While this is actually a good thing and is desirable for the majority of the cases, sometimes you might have a valid reason to have your provider(s) loaded directly.
This is the case in particular for providers that play an active role in the background of your application, but are never referenced by other components or providers.
For more information when this is useful and the rationale for this package see the following article: [Eager loading in Angular 2](https://github.com/dscheerens/ngx-eager-provider-loader/blob/master/eager-loading-in-angular-2.md)

### Eager loading API

To enable eager loading for your provider(s), first find the `@NgModule` class in which the provider should be loaded.
Usually you'll want to set this up in your application root module (often called `AppModule`).
Once you've found the module in which the provider should be loaded, import the `EagerProviderLoaderModule`:

```typescript
import { EagerProviderLoaderModule } from 'ngx-inject';

@NgModule({
    imports: [ EagerProviderLoaderModule ]
})
export class AppModule { }
```

By importing the `EagerProviderLoaderModule` your application will load all providers on startup that have been registered as eagerly loaded providers.
Although not strictly necessary, it is best to import this module in every module in which you mark providers for eager loading.
This improves the reusability of those modules, since they don't depend on other modules to import the `EagerProviderLoaderModule`.

After having imported the `EagerProviderLoaderModule`, you need to define which providers you want to have loaded eagerly.
This is done using the `eagerLoad` function, which you simply _wrap_ around the provider(s) that should be eagerly loaded, for example:

```typescript
import { EagerProviderLoaderModule, eagerLoad } from 'ngx-inject';

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [
        eagerLoad(AppTitleUpdater)
    ]
})
export class AppModule { }
```

The `eagerLoad` function takes a `Provider` as input and returns a new provider instead.
That new provider is simply an array of two providers:
* The original input provider
* A special marker provider used by the `EagerProviderLoaderModule` to discover which providers need to be eagerly loaded.

Since Angular's `Provider` type also supports arrays (of providers) you can fold multiple `eagerLoad` calls into one.
This is shown in following example:

```typescript
import { EagerProviderLoaderModule, eagerLoad } from 'ngx-inject';

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [
        eagerLoad([
            AppTitleUpdater,
            ConsoleLogger,
            LocalizationInitializer
        ])
    ]
})
export class AppModule { }
```

The pattern of importing the `EagerProviderLoaderModule` within a module, together with one or more `eagerLoad` function calls is quite common.
Because of this common pattern a convenience method has been added to combine this all into a single function: the static `for` function of the `EagerProviderLoaderModule` class.
Using this function the previous example can be rewritten as:

```typescript
import { EagerProviderLoaderModule, eagerLoad } from 'ngx-inject';

@NgModule({
    imports: [
        EagerProviderLoaderModule.for([
            AppTitleUpdater,
            ConsoleLogger,
            LocalizationInitializer
        ])
    ]
})
export class AppModule { }
```

> **Both the `eagerLoad` and `EagerProviderLoaderModule.for` functions are compatible with Angular's AoT compiler.**

### Lazy module loading support

The eager provider loader package has support for lazy loaded modules.
However, before using eager provider loading for lazy loaded modules ask yourself whether it actually makes sense that the provider should only be loaded when the module itself is loaded.
In most cases I expect that the provider must be loaded on application startup anyway.
If so, you can simply move the eager loading registration to the module that is being used to bootstrap the application (or to another module that is transitively imported by the root module).

If you still feel that you need eager provider loading for a lazy loaded module, then you can use it in the same way as you would for modules that get loaded on application startup.
Just don't forget to import the `EagerProviderLoaderModule` within these lazy loaded modules.

Note that for providers defined in lazy loaded modules there is a small difference for eager loaded providers compared to normal providers.
Services defined in lazy loaded modules might be [instantiated multiple times](https://angular.io/guide/providers#limiting-provider-scope-by-lazy-loading-modules) by Angular itself.
The eager provider loader, however, will only load providers marked for eager loading once.
If a provider has already been eagerly loaded, then the `EagerProviderLoaderModule` will do not this again for the same provider.
This ensures that the service defined by the provider is only instantiated once.
