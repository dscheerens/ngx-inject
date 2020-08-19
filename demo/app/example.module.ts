import { HttpClient } from '@angular/common/http';
import { NgModule, ModuleWithProviders, InjectionToken, Provider } from '@angular/core';
import { UnboundProvider, bindProvider } from 'ngx-inject';

export const EXAMPLE_MODULE_HTTP_CLIENT = new InjectionToken<HttpClient>('EXAMPLE_MODULE_HTTP_CLIENT');

export abstract class ExampleService {

    public abstract greet(name: string): string;

}

export const SECRET_MESSAGE = new InjectionToken<string>('SECRET_MESSAGE');

export const MAGIC_NUMBER = new InjectionToken<number>('MAGIC_NUMBER');

export const REFERENCE_DATE = new InjectionToken<Date>('REFERENCE_DATE');

export function defaultReferenceDateFactory(): Date {
    return new Date();
}

export abstract class NumberStorage {
    public abstract number: number;
}

export class L33tNumberStorage {
    public number = 1337;
}

interface ExampleModuleOptions {
    httpClient: UnboundProvider<HttpClient>;
    service: UnboundProvider<ExampleService>;
    secretMessage: UnboundProvider<string>;
    magicNumber: UnboundProvider<number>;
    referenceDate?: UnboundProvider<Date>;
    numberStorage: UnboundProvider<NumberStorage>;
}

@NgModule({})
export class ExampleModule {

    public static withConfig(options: ExampleModuleOptions): ModuleWithProviders<ExampleModule> {
        return {
            ngModule: ExampleModule,
            providers: [
                bindProvider(EXAMPLE_MODULE_HTTP_CLIENT, options.httpClient),
                bindProvider(ExampleService, options.service),
                bindProvider(SECRET_MESSAGE, options.secretMessage),
                bindProvider(MAGIC_NUMBER, options.magicNumber, { multi: true }),
                bindProvider(REFERENCE_DATE, options.referenceDate, { default: { useFactory: defaultReferenceDateFactory } }),
                bindProvider(NumberStorage, options.numberStorage)
            ]
        };
    }

}

export function magicNumber(magicNum: UnboundProvider<number>): Provider {
    return bindProvider(MAGIC_NUMBER, magicNum, { multi: true });
}
