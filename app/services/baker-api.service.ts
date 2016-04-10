import {Injectable} from 'angular2/core';
import {Http, Response, Headers, RequestOptions, RequestMethod} from 'angular2/http';
import {tokenNotExpired} from 'angular2-jwt';
import {Observable} from 'rxjs/Observable';
import {LoginForm} from '../forms/login-form';
import {ResetForm} from '../forms/reset-form';

@Injectable()
export class BakerApiService {

    private url = 'http://localhost:3000';

    constructor(private http: Http) {}

    login(l: LoginForm) {
        let body = JSON.stringify({
            "auth": l
	});
	let headers = new Headers({ 
	    'Content-Type': 'application/json' 
	});
        let options = new RequestOptions({ headers: headers });
	return this.http.post(this.url + '/knock/auth_token', body, options).map(res => {
	        localStorage.setItem('id_token', res.json().jwt);
                return res.ok;
	    }).catch(this.handleError);
    }

    isLoggedIn() {
        return tokenNotExpired();
    }

    logout() {
        localStorage.removeItem('id_token');
    }

    forgot(email: string) {
        let body = JSON.stringify({
	    'email': email
	});
        let headers = new Headers({ 
	    'Content-Type': 'application/json' 
	});
	let options = new RequestOptions({ headers: headers });
	return this.http.post(this.url + '/password_resets', body, options).map(res => res.ok).catch(this.handleError);
    }

    reset(id: string, r: ResetForm) {
    	let body = JSON.stringify(r);
	let headers = new Headers({ 
	    'Content-Type': 'application/json' 
	});
	let options = new RequestOptions({ headers: headers });
	return this.http.patch(this.url + '/password_resets/' + id, body, options).map(res => res.ok).catch(this.handleError);
    }


    private handleError(error: Response) {
        console.error(error);
	return Observable.throw(error.json().error || 'Server Error');
    }
}
