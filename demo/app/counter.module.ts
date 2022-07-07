/* eslint-disable max-classes-per-file */
import { Injectable, NgModule } from '@angular/core';
import { EagerProviderLoaderModule, eagerLoad } from 'ngx-inject';

@Injectable({ providedIn: 'root' })
export class CounterService {

    private counterValue = 0;

    public get count(): number {
        return this.counterValue;
    }

    public increment(): void {
        this.counterValue++;
    }

}

@Injectable()
export class CounterIncrementer {

    constructor(counterService: CounterService) {
        counterService.increment();
    }

}

@Injectable()
export class AnotherCounterIncrementer {

    constructor(counterService: CounterService) {
        counterService.increment();
    }

}

export function anotherCounterIncrementerFactory(counterService: CounterService): AnotherCounterIncrementer {
    return new AnotherCounterIncrementer(counterService);
}

@NgModule({
    imports: [
        EagerProviderLoaderModule.for([
            { provide: 'foo', useFactory: anotherCounterIncrementerFactory, deps: [CounterService] },
            { provide: 'bar', useFactory: anotherCounterIncrementerFactory, deps: [CounterService ] },
        ]),
    ],
    providers: [
        eagerLoad([
            CounterIncrementer,
        ]),
        eagerLoad({ provide: 'baz', useFactory: anotherCounterIncrementerFactory, deps: [CounterService] }),
    ],
})
export class CounterModule {

}
