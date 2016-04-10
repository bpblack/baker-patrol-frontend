import {Component} from 'angular2/core';
import {Router} from 'angular2/router';
import {BakerApiService} from '../services/baker-api.service';

@Component({
    selector: 'baker-patrol-forgot',
    templateUrl: 'app/views/forgot.component.html',
    styleUrls: ['app/styles/login.component.css']
})

export class ForgotComponent {
    forgot = '';
    errorMessage: string;

    constructor(private _apiService: BakerApiService, private _router: Router) {}
 
    onSubmit() {
        this.errorMessage='';
	this._apiService.forgot(this.forgot).subscribe(
	    success => this.errorMessage = 'Check for a reset email',
            error => this.errorMessage = error 
        );
    }

    get diagnostic() { return JSON.stringify({'email': this.forgot}); }

}
