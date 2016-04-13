import {Component, provide} from 'angular2/core';
import {RouteConfig, ROUTER_PROVIDERS, Router} from 'angular2/router';
import {tokenNotExpired} from 'angular2-jwt';
import {LoggedInRouterOutlet} from './directives/logged-in-router-outlet.directive';
import {LoginComponent} from './components/login.component';
import {DashComponent} from './components/dash.component';
import {ForgotComponent} from './components/forgot.component';
import {ResetComponent} from './components/reset.component';
import {IAuthService} from './services/iauth.service';
import {BakerApiService} from './services/baker-api.service';

@RouteConfig([
    { 
        path: "/Login",     
        name: "Login",     
        component: LoginComponent 
    },
    {
        path: "/Dash",
	name: "Dash",
	component: DashComponent,
	useAsDefault: true,
	data: {roles: []}
    },
    {
        path: "/Forgot",
	name: "Forgot",
	component: ForgotComponent
    },
    {
        path: "/Reset/:id",
	name: "Reset",
	component: ResetComponent
    }
])

@Component({
    selector: 'baker-patrol-app',
    template: `
    	<router-outlet></router-outlet>
	{{diagnostic}}
    `,
    directives: [LoggedInRouterOutlet],
    providers: [ROUTER_PROVIDERS, BakerApiService, provide(IAuthService, {useClass: BakerApiService})]
})

export class AppComponent {

    constructor(private _router: Router) {}

    get diagnostic() { return JSON.stringify({jwt: tokenNotExpired()}); }
}
