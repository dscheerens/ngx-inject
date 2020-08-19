import { Injectable, Injector, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EAGER_PROVIDER, EagerProviderLoaderModule, EagerProviderLoaderService, eagerLoad } from './eager-provider-loading';

let testProviderInitializeCount: number;

@Injectable()
class TestProvider {

    constructor() {
        testProviderInitializeCount++;
    }

}

@Injectable()
class AnotherTestProvider {

    constructor() {
        testProviderInitializeCount++;
    }

}

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerLoad(TestProvider) ]
})
class TestModuleA { }

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerLoad(TestProvider), eagerLoad(AnotherTestProvider) ]
})
class TestModuleB { }

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ ]
})
class TestModuleC { }

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerLoad({ provide: 'foo', useFactory: () => new TestProvider() }) ]
})
class TestModuleD { }

@NgModule({
    imports: [ EagerProviderLoaderModule ],
    providers: [ eagerLoad([
        TestProvider,
        { provide: 'foo', useFactory: () => new AnotherTestProvider() }
    ]) ]
})
class TestModuleE { }

@NgModule({
    imports: [
        EagerProviderLoaderModule.for([
            TestProvider,
            { provide: 'foo', useFactory: () => new AnotherTestProvider() }
        ])
    ]
})
class TestModuleF { }

describe('eager provider loader module', () => {

    beforeEach(() => {
        testProviderInitializeCount = 0;
    });

    it('loads eager providers on application startup', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleA, TestModuleB, TestModuleC ]
        });

        TestBed.inject(TestModuleA);

        expect(testProviderInitializeCount).toBe(2);
    });

    it('supports providers other than type providers', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleD ]
        });

        TestBed.inject(TestModuleD);

        expect(testProviderInitializeCount).toBe(1);
    });

    it('supports arrays of providers', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleE ]
        });

        TestBed.inject(TestModuleE);

        expect(testProviderInitializeCount).toBe(2);
    });

    it('never loads a provider more than once', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleA, TestModuleB, TestModuleC ]
        });

        const injector: Injector = TestBed.inject(Injector);
        const eagerProviderLoaderService = injector.get(EagerProviderLoaderService);
        const providers = injector.get<any[]>(EAGER_PROVIDER);

        expect(providers.length).toBeGreaterThan(0);

        injector.get(TestModuleA);
        injector.get(TestModuleB);

        expect(testProviderInitializeCount).toBe(2);

        const loader1 = new EagerProviderLoaderModule(eagerProviderLoaderService, providers, injector);
        const loader2 = new EagerProviderLoaderModule(eagerProviderLoaderService, providers, injector);

        expect(loader1).toBeDefined();
        expect(loader2).toBeDefined();
        expect(testProviderInitializeCount).toBe(2);
    });

    it('does not break when no eager provider tokens are present', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleC ]
        });

        TestBed.inject(TestModuleC);

        expect(testProviderInitializeCount).toBe(0);
    });

    it('supports eager loading via the static `EagerProviderLoaderModule.for` function', () => {
        TestBed.configureTestingModule({
            imports: [ TestModuleF ]
        });

        TestBed.inject(TestModuleF);

        expect(testProviderInitializeCount).toBe(2);
    });

});
