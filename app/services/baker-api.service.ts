import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {AuthHttp, AuthConfig, tokenNotExpired, JwtHelper} from 'angular2-jwt';
import {Observable} from 'rxjs/Observable';
import {IAuthService} from './iauth.service';
import {LoginForm} from '../forms/login-form';
import {ResetForm} from '../forms/reset-form';

@Injectable()
export class BakerApiService implements IAuthService {

  private url = 'http://localhost:3000/api';
  private jwtHelper: JwtHelper = new JwtHelper();

  constructor(private http: Http, private authHttp: AuthHttp) {}

  login(l: LoginForm) {
    let body = JSON.stringify({
      'auth': l
	  });
    return this.http.post(this.url + '/knock/auth_token', body, this.defaultOptions()).map(
      res => {
        localStorage.setItem('id_token', res.json().jwt);
        return res.ok;
	    }
    ).catch(this.handleError);
  }

  isLoggedIn() {
    return tokenNotExpired();
  }

  hasRole(roles: string[]) {
    // TODO: replace stub with array intersect when jwt includes roles
    return true;
  }

  logout() {
    localStorage.removeItem('id_token');
  }

  forgot(email: string) {
    let body = JSON.stringify({
      'email': email
	  });
    return this.http.post(this.url + '/password_resets', body, this.defaultOptions()).map(res => res.ok).catch(this.handleError);
  }

  reset(id: string, r: ResetForm) {
    let body = JSON.stringify(r);
    return this.http.patch(this.url + '/password_resets/' + id, body, this.defaultOptions()).map(res => res.ok).catch(this.handleError);
  }

  userPatrols(user_id: number = this.currentUser(), season_id: number = 0) {
    return this.authHttp.get(this.url + '/users/' + user_id + '/patrols' + ((season_id > 0) ? ('?season_id=' + season_id) : '')).map(
      res => res.json()
    ).catch(this.handleError);
  }

  private defaultOptions() : RequestOptions {
    let headers = new Headers({ 
	    'Content-Type': 'application/json' 
	  });
    return new RequestOptions({ headers: headers});
  } 

  private currentUser() : number {
    return this.jwtHelper.decodeToken(localStorage.getItem('id_token')).id;
  }
  
  private handleError(error: Response) {
    console.error(error);
	  return Observable.throw(error.json().error || 'Server Error');
  }
}
