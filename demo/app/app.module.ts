import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ExampleModule, ExampleService, magicNumber, L33tNumberStorage } from './example.module';
import { CounterModule } from './counter.module';

export function magicNumberFactory(): number {
    return 42;
}

export class ExampleServiceImpl extends ExampleService {

    public greet(name: string): string {
        return `Hello ${name}!`;
    }

}

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ExampleModule.withConfig({
            httpClient: { useExisting: HttpClient },
            service: { useClass: ExampleServiceImpl },
            secretMessage: { useValue: 'pssst... ngx-inject is awesome!' },
            magicNumber: { useFactory: magicNumberFactory },
            numberStorage: L33tNumberStorage,
        }),
        CounterModule,
    ],
    providers: [
        magicNumber({ useValue: 1337 }),
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {
}
