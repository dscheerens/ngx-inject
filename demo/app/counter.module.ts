import { Injectable, NgModule } from '@angular/core';
import { EagerProviderLoaderModule, eagerProvider } from 'ngx-inject';

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

@NgModule({
    imports: [
        EagerProviderLoaderModule
    ],
    providers: [
        CounterIncrementer,
        eagerProvider(CounterIncrementer)
    ]
})
export class CounterModule {

}
