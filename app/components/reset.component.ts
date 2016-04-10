import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {ResetForm} from '../forms/reset-form';
import {BakerApiService} from '../services/baker-api.service';

@Component({
    selector: 'baker-patrol-reset',
    templateUrl: 'app/views/reset.component.html',
    styleUrls: ['app/styles/login.component.css']
})

export class ResetComponent {
    reset = new ResetForm('', '');
    errorMessage: string;

    constructor(private _apiService: BakerApiService, private _router: Router, private _routeParams: RouteParams) {}

    onSubmit() {
        this.errorMessage='';
	this._apiService.reset(this._routeParams.get('id'), this.reset).subscribe(
	    success => this._router.navigate(['Login']),
            error => this.errorMessage = error 
        );
    }

    get diagnostic() { return JSON.stringify(this.reset); }

}
