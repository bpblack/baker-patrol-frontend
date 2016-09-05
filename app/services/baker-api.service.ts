import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {AuthHttp, AuthConfig, tokenNotExpired, JwtHelper} from 'angular2-jwt';
import {Observable} from 'rxjs/Rx';
import {IAuthService} from './iauth.service';
import {LoginForm, ResetForm, CreateSubEmailForm, CreateSubAssignForm, AssignSubForm, RejectSubForm} from '../forms/forms';

@Injectable()
export class BakerApiService implements IAuthService {

  private url = 'http://localhost:3000/api';
  private jwtHelper: JwtHelper = new JwtHelper();
  private _currentUserExtra: Object;
  private _currentUserExtraObservable: Observable<Object>;

  constructor(private http: Http, private authHttp: AuthHttp) {}

  login(l: LoginForm) : Observable<boolean> {
    let jwt: Object;
    let body = JSON.stringify({
      'auth': l
	  });
    return this.http.post(this.url + '/user_token', body, this.defaultOptions()).map(
      res => {
        localStorage.setItem('id_token', res.json().jwt);
        return res.ok;
	    },
      err => {}
    ).catch(this.handleError);
  }

  isLoggedIn() {
    return tokenNotExpired();
  }
  
  // returns a stream of role objects
  findRoles(...roles: Array<string>) : Observable<any> {
    // convert roles to a "set" for O(1) test in filter
    let roleSet = {};
    for (var role of roles) {
      roleSet[role] = 1;
    }
    return this.userRoles().flatMap(x => x).filter(x => x['role'] in roleSet);
  }

  userName() : Observable<string> {
    if (this.isLoggedIn()) {
      return this.currentUserExtra().map(
        extra => { return extra.name; }
      );
    }
  }

  userSeasons() : Observable<Array<any>> {
    if (this.isLoggedIn()) {
      return this.currentUserExtra().map(
        extra => { return extra.seasons; }
      );
    }
  }

  userRoles() : Observable<Array<any>> {
    if (this.isLoggedIn()) {
      return this.currentUserExtra().map(
        extra => { return extra.roles; }
      );
    }
  }
      
  logout() {
    localStorage.removeItem('id_token');
    this._currentUserExtra = null;
    this._currentUserExtraObservable = null;
  }

  forgot(email: string) {
    let body = JSON.stringify({
      'email': email
	  });
    return this.http.post(this.url + '/password_resets', body, this.defaultOptions()).map(
      res => res.ok
    ).catch(this.handleError);
  }

  reset(id: string, r: ResetForm) {
    let body = JSON.stringify(r);
    return this.http.patch(this.url + '/password_resets/' + id, body, this.defaultOptions()).map(res => res.ok).catch(this.handleError);
  }

  
  patrols(seasonId: number, userId: number = this.currentUser()) : Observable<Array<Object>> {
    return this.authHttp.get(this.url + '/users/' + userId + '/seasons/' + seasonId + '/patrols').map(
      res => res.json().patrols
    ).catch(this.handleError);
  }

  dutyDay(dutyDayId: number) : Observable<Object> {
    return this.authHttp.get(this.url + '/duty_days/' + dutyDayId).map(
      res => res.json()
    ).catch(this.handleError);
  }

  team(seasonId: number, userId: number = this.currentUser()) {
    return this.authHttp.get(this.url + '/users/' + userId + '/seasons/' +  seasonId + '/teams').map(
      res => res.json()
    ).catch(this.handleError);
  }

  createSubEmailRequest(patrolId: number, cs: CreateSubEmailForm) : Observable<any> {
    let body = JSON.stringify(cs);
    return this.authHttp.post(this.url + '/patrols/' + patrolId + '/substitutions', body, this.defaultOptions()).map(
      res => res.json()
    ).catch(this.handleError);
  }

  createSubAssignRequest(patrolId: number, cs: CreateSubAssignForm) : Observable<any> {
    let body = JSON.stringify(cs);
    return this.authHttp.post(this.url + '/patrols/' + patrolId + '/substitutions', body, this.defaultOptions()).map(
      res => res.json()
    ).catch(this.handleError);
  }

  getAssignableUsers(patrolId: number) : Observable<Array<any>> {
    return this.authHttp.get(this.url + '/patrols/' + patrolId + '/assignable').map(
      res => res.json().assignable_users
    ).catch(this.handleError);
  }

  assignSubRequest(substitutionId: number, a: AssignSubForm) : Observable<any> {
    let body = JSON.stringify(a);
    return this.authHttp.patch(this.url + '/substitutions/' + substitutionId + '/assign', body, this.defaultOptions()).map(
      res => res.json()
    ).catch(this.handleError);
  }

  remindSubRequest(substitutionId: number, r: RejectSubForm) : Observable<any> { //Reject contains just a message, should work fine
    let body = JSON.stringify(r);
    return this.authHttp.post(this.url + '/substitutions/' + substitutionId + '/remind', body, this.defaultOptions()).catch(this.handleError);
  }

  deleteSubRequest(substitutionId: number) : Observable<any> {
    return this.authHttp.delete(this.url + '/substitutions/' + substitutionId);
  }

  getSubRequests(seasonId:number, userId: number = this.currentUser()) : Observable<Array<Object>> {
    return this.authHttp.get(this.url + '/users/' + userId + '/seasons/' + seasonId + '/substitutions?assignable=true').map(
      res => res.json().substitutions
    ).catch(this.handleError);
  }

  acceptSubRequest(id: number) : Observable<boolean> {
    return this.authHttp.patch(this.url + '/substitutions/' + id + '/accept', '', this.defaultOptions).map(
      res => res.ok
    ).catch(this.handleError);
  }

  rejectSubRequest(id: number, r: RejectSubForm) : Observable<boolean> {    
    let body = JSON.stringify(r);
    return this.authHttp.patch(this.url + '/substitutions/' + id + '/reject', body, this.defaultOptions()).map(
      res => res.ok
    ).catch(this.handleError);
  }

  getSubHistory(id: number) : Observable<Array<any>> {
    return this.authHttp.get(this.url + '/admin/patrols/' + id + '/substitutions').map(
      res => res.json().sub_history
    ).catch(this.handleError);
  }

  private defaultOptions() : RequestOptions {
    let headers = new Headers({ 
	    'Content-Type': 'application/json' 
	  });
    return new RequestOptions({ headers: headers});
  } 

  private currentUser() : number {
    return this.jwtHelper.decodeToken(localStorage.getItem('id_token')).sub;
  }

  private currentUserExtra() : Observable<any>{
    if (this._currentUserExtra) {
      //observable completed, get observable of the data 
      return Observable.of(this._currentUserExtra);
    } else if (this._currentUserExtraObservable) {
      //observable still running, return it
      return this._currentUserExtraObservable;
    } else {
      //haven't made the api call yet.
      this._currentUserExtraObservable = this.authHttp.get(this.url + '/users/' + this.currentUser() + '/extra').map(
        res => { return res.json() }
      ).do(
        extra => {
          this._currentUserExtra = extra;
          this._currentUserExtraObservable = null;
        }
      ).catch(this.handleError).share();
      return this._currentUserExtraObservable;
    }  
  }
  
  private handleError(error: Response) {
    console.error(error);
	  return Observable.throw(error.json().error || 'Server Error');
  }

}
