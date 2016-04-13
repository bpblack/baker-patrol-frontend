import {Component} from 'angular2/core';
import {Router} from 'angular2/router';
import {FormBuilder, Validators, Control, ControlGroup, FORM_DIRECTIVES} from 'angular2/common';
import {BakerApiService} from '../services/baker-api.service';
import {emailRegexp} from '../validations/validations';

@Component({
    selector: 'baker-patrol-forgot',
    templateUrl: 'app/views/forgot.component.html',
    styleUrls: ['app/styles/login.component.css'],
    directives: [FORM_DIRECTIVES]
})

export class ForgotComponent {
    forgotForm: ControlGroup;
    message: string;
    success: boolean;
    error: boolean;

    constructor(private _apiService: BakerApiService, private _router: Router, fb: FormBuilder) {
        this.forgotForm = fb.group({
	    email: ['',Validators.compose([
	        Validators.required,
		Validators.pattern(emailRegexp)]) 
	    ]
	});
    }
 
    onSubmit() {
        this.message = '';
	this.success = false;
	this.error = false;
	this._apiService.forgot(this.forgotForm.controls['email'].value).subscribe(
	    success => { this.success = true; this.message = 'Check your email for reset instructions.'; },
	    error => { this.error = true; this.message = error; } 
        );
    }

    wasSuccess() {
        return this.success == true;
    }

    hasError() {
        return this.error == true;
    }

    get diagnostic() { return JSON.stringify({'email': this.forgotForm.controls['email'].value, 'success': this.wasSuccess(), 'error': this.hasError(), 'message': (<string>this.message)}); }

}
