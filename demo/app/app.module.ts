import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { useFactory } from 'ngx-inject';

import { AppComponent } from './app.component';
import { ExampleModule, ExampleService, magicNumber, L33tNumberStorage } from './example.module';
import { CounterModule } from './counter.module';

interface MagicNumberResolver {
    getMagicNumber(): number;
}

export function magicNumberFactory(magicNumberResolver: MagicNumberResolver): number {
    return magicNumberResolver.getMagicNumber();
}

@Injectable({ providedIn: 'root' })
export class ExampleMagicNumberResolver implements MagicNumberResolver {
    public getMagicNumber(): number {
        return 42;
    }
}

export const GREETING = new InjectionToken<string>('greeting', {
    providedIn: 'root',
    factory: () => 'Hello',
});

@Injectable({ providedIn: 'root' })
export class Greeter {
    public createGreetingMessage(greeting: string, name: string): string {
        return `${greeting} ${name}!`;
    }
}

@Injectable()
export class ExampleServiceImpl extends ExampleService {
    constructor(private readonly greater: Greeter, @Inject(GREETING) private readonly greeting: string) {
        super();
    }

    public greet(name: string): string {
        return this.greater.createGreetingMessage(this.greeting, name);
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
            magicNumber: useFactory(magicNumberFactory, ExampleMagicNumberResolver),
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
