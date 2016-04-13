import {bootstrap}    from 'angular2/platform/browser';
import {provide, ComponentRef} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './app.component';
import 'rxjs/Rx';


bootstrap(AppComponent, [
    HTTP_PROVIDERS 
]);
