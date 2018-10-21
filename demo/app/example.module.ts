import { HttpClient } from '@angular/common/http';
import { NgModule, ModuleWithProviders, InjectionToken, Provider } from '@angular/core';
import { UnboundProvider, bindProvider } from 'ngx-inject'; // tslint:disable-line:no-implicit-dependencies

export const EXAMPLE_MODULE_HTTP_CLIENT = new InjectionToken<HttpClient>('EXAMPLE_MODULE_HTTP_CLIENT');

export abstract class ExampleService {

    public abstract greet(name: string): string;

}

export const SECRET_MESSAGE = new InjectionToken<string>('SECRET_MESSAGE');

export const MAGIC_NUMBER = new InjectionToken<number>('MAGIC_NUMBER');

interface ExampleModuleOptions {
    httpClient: UnboundProvider<HttpClient>;
    service: UnboundProvider<ExampleService>;
    secretMessage: UnboundProvider<string>;
    magicNumber: UnboundProvider<number>;
}

@NgModule({})
export class ExampleModule {

    public static withConfig(options: ExampleModuleOptions): ModuleWithProviders {
        return {
            ngModule: ExampleModule,
            providers: [
                bindProvider(EXAMPLE_MODULE_HTTP_CLIENT, options.httpClient),
                bindProvider(ExampleService, options.service),
                bindProvider(SECRET_MESSAGE, options.secretMessage),
                bindProvider(MAGIC_NUMBER, options.magicNumber, { multi: true })
            ]
        };
    }

}

export function magicNumber(magicNum: UnboundProvider<number>): Provider {
    return bindProvider(MAGIC_NUMBER, magicNum, { multi: true });
}
