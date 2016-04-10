import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Http} from 'angular2/http';
import {LoginForm} from '../forms/login-form';
import {BakerApiService} from '../services/baker-api.service';

@Component({
    selector: 'baker-patrol-login',
    templateUrl: 'app/views/login.component.html',
    styleUrls: ['app/styles/login.component.css'],
    directives: [RouterLink]
})

export class LoginComponent {
    errorMessage = '';
    login = new LoginForm('', '');
    
    constructor(private _apiService: BakerApiService, private _router: Router) {}

    onSubmit() {
        this.errorMessage = '';
        this._apiService.login(this.login).subscribe(
	    success => this._router.navigate(['Dash']),
            error => this.errorMessage = error 
        );
    }

    get diagnostic() { return JSON.stringify({'login': this.login}); }
}
