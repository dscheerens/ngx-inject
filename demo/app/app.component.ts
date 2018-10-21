import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EXAMPLE_MODULE_HTTP_CLIENT, ExampleService, SECRET_MESSAGE, MAGIC_NUMBER } from './example.module';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {

    public readonly httpClientOk: boolean;
    public readonly exampleServiceOk: boolean;
    public readonly secretMessageOk: boolean;
    public readonly magicNumberOk: boolean;

    constructor(
        @Inject(EXAMPLE_MODULE_HTTP_CLIENT) httpClient: HttpClient,
        exampleService: ExampleService,
        @Inject(SECRET_MESSAGE) secretMessage: string,
        @Inject(MAGIC_NUMBER) magicNumber: number[],
    ) {
        this.httpClientOk = !!httpClient;
        this.exampleServiceOk = !!exampleService;
        this.secretMessageOk = !!secretMessage;
        this.magicNumberOk = !!magicNumber;
        (console).log('httpClient =', httpClient);
        (console).log('exampleService =', exampleService);
        (console).log('secretMessage =', secretMessage);
        (console).log('magicNumber =', magicNumber);
    }
}
