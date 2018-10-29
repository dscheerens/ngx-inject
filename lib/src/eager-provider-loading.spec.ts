import { Injectable, Injector, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EAGER_PROVIDER, EagerProviderLoaderModule, EagerProviderLoaderService, eagerProvider } from './eager-provider-loading';

let testProviderInitializeCount: number;

@Injectable()
class TestProvider {

    constructor() {
        testProviderInitializeCount++;
    }

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerProvider(TestProvider) ]
})
class TestModuleA {

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerProvider(TestProvider) ]
})
class TestModuleB {

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ ]
})
class TestModuleC {

}

describe('eager provider loader module', () => {

    beforeEach(() => {
        testProviderInitializeCount = 0;
    });

    it('loads eager providers on application startup', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleA, TestModuleB, TestModuleC ]
        });

        TestBed.get(TestModuleA);

        expect(testProviderInitializeCount).toBe(1);
    });

    it('never loads a provider more than once', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleA, TestModuleB, TestModuleC ]
        });

        const injector: Injector = TestBed.get(Injector);
        const eagerProviderLoaderService = injector.get(EagerProviderLoaderService);
        const providers = injector.get<any[]>(EAGER_PROVIDER);

        expect(providers.length).toBeGreaterThan(0);

        injector.get(TestModuleA);
        injector.get(TestModuleB);

        expect(testProviderInitializeCount).toBe(1);

        const loader1 = new EagerProviderLoaderModule(eagerProviderLoaderService, providers, injector);
        const loader2 = new EagerProviderLoaderModule(eagerProviderLoaderService, providers, injector);

        expect(loader1).toBeDefined();
        expect(loader2).toBeDefined();
        expect(testProviderInitializeCount).toBe(1);
    });

    it('does not break when no eager provider tokens are present', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleC ]
        });

        TestBed.get(TestModuleC);

        expect(testProviderInitializeCount).toBe(0);
    });

});
