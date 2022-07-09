# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/dscheerens/ngx-inject/compare/v4.0.0...v4.1.0) (2022-07-09)


### Features

* add factory functions to create `UnboundProvider` values ([ee88c45](https://github.com/dscheerens/ngx-inject/commit/ee88c451a66f3b34108ccf1ff7560b62d50e0077))
* deprecate `InjectableType` and `Token` types ([8d763f1](https://github.com/dscheerens/ngx-inject/commit/8d763f143295fb95fc0c9de2dd3e3c4cb48c7585))
* expand `UnboundProvider<T>` type to also allow values of type `T` directly ([490984c](https://github.com/dscheerens/ngx-inject/commit/490984cff217810fdb3af3a31d2268e8be61e523))


### Bug Fixes

* `bindProvider` returning an incorrect provider for falsy values with `useValue` ([329187f](https://github.com/dscheerens/ngx-inject/commit/329187f2ef588c406092a4b7d71403895d612f73))

## [4.0.0](https://github.com/dscheerens/ngx-inject/compare/v3.0.0...v4.0.0) (2021-11-24)


### ⚠ BREAKING CHANGES

* **deps:** peer dependencies have been updated to require at least Angular 13.0.0

* **deps:** upgrade to Angular 13 ([26fbec4](https://github.com/dscheerens/ngx-inject/commit/26fbec4c552957a31fa67630f7fdb5f4e1eadeff))

## [3.0.0](https://github.com/dscheerens/ngx-inject/compare/v2.0.0...v3.0.0) (2020-08-19)


### ⚠ BREAKING CHANGES

* due to the updated dependencies this package now requires at least Angular 10.

### Features

* Angular 10 support ([6873dac](https://github.com/dscheerens/ngx-inject/commit/6873dac30f713a3b68584a90b04b3e2f3d3dad74))

## [2.0.0](https://github.com/dscheerens/ngx-inject/compare/v1.0.0...v2.0.0) (2020-01-11)


### ⚠ BREAKING CHANGES

* **deps:** due to the updated dependencies this package now requires at least Angular 8.

### Features

* support type providers for provider binding ([40cf9d0](https://github.com/dscheerens/ngx-inject/commit/40cf9d007e7356e84708c724e5d0bcea0417c5ef))


* **deps:** update dependencies ([9052d65](https://github.com/dscheerens/ngx-inject/commit/9052d65494be9d8ba745fc3dca909814faa6cf9e))
