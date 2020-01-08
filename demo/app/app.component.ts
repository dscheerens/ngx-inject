import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    EXAMPLE_MODULE_HTTP_CLIENT,
    ExampleService,
    SECRET_MESSAGE,
    MAGIC_NUMBER,
    REFERENCE_DATE,
    NumberStorage,
    L33tNumberStorage
} from './example.module';
import { CounterService } from './counter.module';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    public readonly httpClientOk: boolean;
    public readonly exampleServiceOk: boolean;
    public readonly secretMessageOk: boolean;
    public readonly magicNumberOk: boolean;
    public readonly referenceDateOk: boolean;
    public readonly counterValue: number;
    public readonly numberStorageOk: boolean;
    public readonly l33tNumberStorageOk: boolean;

    constructor(
        @Inject(EXAMPLE_MODULE_HTTP_CLIENT) httpClient: HttpClient,
        exampleService: ExampleService,
        @Inject(SECRET_MESSAGE) secretMessage: string,
        @Inject(MAGIC_NUMBER) magicNumber: number[],
        @Inject(REFERENCE_DATE) referenceDate: Date,
        counterService: CounterService,
        numberStorage: NumberStorage,
        l33tNumberStorage: L33tNumberStorage
    ) {
        this.httpClientOk = !!httpClient;
        this.exampleServiceOk = !!exampleService;
        this.secretMessageOk = !!secretMessage;
        this.magicNumberOk = !!magicNumber;
        this.referenceDateOk = !!referenceDate;
        this.numberStorageOk = !!numberStorage;
        this.l33tNumberStorageOk = !!l33tNumberStorage;
        (console).log('httpClient =', httpClient);
        (console).log('exampleService =', exampleService);
        (console).log('secretMessage =', secretMessage);
        (console).log('magicNumber =', magicNumber);
        (console).log('referenceDate =', referenceDate);
        (console).log('numberStorage =', numberStorage);
        (console).log('l33tNumberStorage =', l33tNumberStorage);

        this.counterValue = counterService.count;
    }
}
