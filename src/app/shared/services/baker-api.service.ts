import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, BehaviorSubject, throwError, ReplaySubject} from 'rxjs';
import { catchError, first, map, mergeMap } from 'rxjs/operators';
import { IAuthService } from './iauth.service';
import { tokenGetter } from 'src/app/app.module';
import { environment } from 'src/environments/environment';

export interface RequestOptions {
    headers?: HttpHeaders
}

export interface UserToken {
    jwt: string;
}

export interface Season {
  id: number;
  name: string;
  start: Date;
  end: Date;
}

export interface Role {
  role: string;
  team_id?: number;
  season_id?: number;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  seasons: Season[];
  roles: Role[];
}

export interface RosterUser {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  roles?: Role[];
}

export interface TeamRoster {
  name: string;
  leader?: RosterUser;
  members: RosterUser[];
  duty_days?: DutyDay[];
  collapsed?: boolean;
}

interface SeasonRoster {
  roster: TeamRoster[];
}

export interface Team {
  id: number;
  name: string;
}

export interface GoogleAuth {
  uri: string;
}

export interface GoogleCalendar {
  name: string;
  id: string;
}

export interface Google {
  current: string;
  calendars: Array<GoogleCalendar>;
}

export interface DutyDay {
  id: number;
  date: string;
  team?: Team;
}

export interface SubAssignment {
  id: number;
  sub_id: number;
  sub_name: string;
}

interface UserNameForm {
  first_name: string;
  last_name: string;
}

interface UserEmailForm {
  email: string;
}

interface UserPhoneForm {
  phone: string;
}

interface UserPasswordForm {
  password: string;
  new_password: string;
  confirm_password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface ResetForm {
  password: string;
  confirm_password: string;
}

interface EmailForm {
  message: string;
  to_id?: number;
  reason?: string;
}

interface AssignForm {
  assigned_id: number;
  reason?: string;
}

interface SwapForm {
  with: number;
}

interface GoogleCalendarForm {
  calendar_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class BakerApiService implements IAuthService {

  private url = 'https://volypatrol.mtbaker.us/api';//environment.apiUrl;
  private didLogin: boolean = false;
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private _currentUserActual: User;
  private _observable: Observable<User>;
  private _subscription: any;
  private _currentUser: ReplaySubject<User>;

  constructor(private http: HttpClient) {
    this._currentUser = new ReplaySubject(1);
  }

  isLoggedIn() {
    let active = !this.jwtHelper.isTokenExpired(tokenGetter());
    return active;
  }

  get currentUser(): ReplaySubject<User> {
    if (this.isLoggedIn() && !this.didLogin) {
      this.getCurrentUser();
      this.didLogin = true;
    }
    return this._currentUser;
  }

  get currentUserSeason(): Observable<Season> {
    return this.currentUser.pipe(
      mergeMap(u => u.seasons), first()
    );
  }

  login(l: LoginForm) : Observable<boolean> {
    let body = JSON.stringify({
      'auth': l
    });
    const ret = this.http.post<UserToken>(this.url + '/user_token', body, this.defaultOptions()).pipe(
      map(res => { 
        localStorage.setItem('id_token', res.jwt); 
        this.getCurrentUser(); 
        return true;
      }),
      catchError(this.handleError)
    );
    return ret;
  }

  logout() {
    localStorage.removeItem('id_token');
  }

  forgot(email: string): Observable<boolean> {
    let body = JSON.stringify({
        'email': email
    });
    return this.http.post(this.url + '/password_resets', body, this.defaultOptions()).pipe(
        map(res => true),
        catchError(this.handleError)
    );
  }

//   reset(id: string, r: ResetForm) {
//     let body = JSON.stringify(r);
//     return this.http.patch(this.url + '/password_resets/' + id, body, this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   patrols(seasonId: number, userId: number = this.currentUserId()) : Observable<Array<Object>> {
//     return this.http.get(this.url + '/users/' + userId + '/seasons/' + seasonId + '/patrols', this.defaultOptions()).map(
//       res => res.json().patrols
//     ).catch(this.handleError);
//   }

//   dutyDay(dutyDayId: number) : Observable<Object> {
//     return this.http.get(this.url + '/duty_days/' + dutyDayId, this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }


//   getSeasonDutyDays(seasonId: number) : Observable<Array<DutyDay>> {
//     return this.http.get(this.url + '/seasons/' + seasonId + '/duty_days', this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

    getSeasonRoster(seasonId: number) : Observable<TeamRoster[]> {
      return this.http.get<SeasonRoster>(this.url + '/seasons/' + seasonId + '/roster', this.defaultOptions()).pipe(
        map(r => r.roster),
        catchError(this.handleError)
      );
    }

//   swapResponsibilities(patrolId: number, s: SwapForm) {
//     let body = JSON.stringify(s);
//     return this.http.patch(this.url + '/patrols/' + patrolId + '/swap', body, this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

  team(seasonId: number, userId: number = this.currentUserId()): Observable<TeamRoster> {
    return this.http.get<TeamRoster>(this.url + '/users/' + userId + '/seasons/' +  seasonId + '/teams', this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

//   createSubEmailRequest(patrolId: number, cs: EmailForm) : Observable<any> {
//     let body = JSON.stringify(cs);
//     return this.http.post(this.url + '/patrols/' + patrolId + '/substitutions', body, this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

//   createSubAssignRequest(patrolId: number, cs: AssignForm) : Observable<SubAssignment> {
//     let body = JSON.stringify(cs);
//     return this.http.post(this.url + '/patrols/' + patrolId + '/substitutions', body, this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

//   getAssignableUsers(patrolId: number) : Observable<Array<any>> {
//     return this.http.get(this.url + '/patrols/' + patrolId + '/assignable', this.defaultOptions()).map(
//       res => res.json().assignable_users
//     ).catch(this.handleError);
//   }

//   assignSubRequest(substitutionId: number, a: AssignForm) : Observable<SubAssignment> {
//     let body = JSON.stringify(a);
//     return this.http.patch(this.url + '/substitutions/' + substitutionId + '/assign', body, this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

//   remindSubRequest(substitutionId: number, r: EmailForm, toId: number = null) : Observable<any> { //Reject contains just a message, should work fine
//     if (toId > 0) {
//       r.to_id = toId;
//     }
//     let body = JSON.stringify(r);
//     return this.http.post(this.url + '/substitutions/' + substitutionId + '/remind', body, this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   deleteSubRequest(substitutionId: number) : Observable<any> {
//     return this.http.delete(this.url + '/substitutions/' + substitutionId).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   getSubstitutions(seasonId:number, params: Array<Array<string>> = [], userId: number = this.currentUserId()) : Observable<any> {
//     let paramsStr = '';
//     for (let pair of params) {
//       paramsStr += paramsStr.length === 0 ? '?' : '&';
//       paramsStr += pair[0] + '=' + pair[1];
//     }
//     return this.http.get(this.url + '/users/' + userId + '/seasons/' + seasonId + '/substitutions' + paramsStr, this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

//   acceptSubRequest(id: number) : Observable<boolean> {
//     return this.http.patch(this.url + '/substitutions/' + id + '/accept', '', this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   rejectSubRequest(id: number, r: EmailForm) : Observable<boolean> {
//     let body = JSON.stringify(r);
//     return this.http.patch(this.url + '/substitutions/' + id + '/reject', body, this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   getSubHistory(id: number) : Observable<Array<any>> {
//     return this.http.get(this.url + '/admin/patrols/' + id + '/substitutions', this.defaultOptions()).map(
//       res => res.json().sub_history
//     ).catch(this.handleError);
//   }
  
//   getAvailablePatrollers(id: number) : Observable<Array<string>> {
//     return this.http.get(this.url + '/admin/duty_days/' + id + '/available_patrollers', this.defaultOptions()).map(
//       res => res.json().emails
//     ).catch(this.handleError);
//   }

//   updateUser(form: UserNameForm | UserEmailForm | UserPhoneForm | UserPasswordForm, userId: number = this.currentUserId()): Observable<boolean> {
//     let body = JSON.stringify(form);
//     return this.http.patch(this.url + '/users/' + userId, body, this.defaultOptions()).map(
//       res => {
//         if((<UserNameForm>form).first_name !== undefined) {
//           this._currentUserActual.name = (<UserNameForm>form).first_name + ' ' + (<UserNameForm>form).last_name;
//           this.setCurrentUser(this._currentUserActual);
//         } else if ((<UserEmailForm>form).email !== undefined) {
//           this._currentUserActual.email = (<UserEmailForm>form).email;
//           this.setCurrentUser(this._currentUserActual);
//         } else if ((<UserPhoneForm>form).phone !== undefined) {
//           this._currentUserActual.phone = (<UserPhoneForm>form).phone;
//           this.setCurrentUser(this._currentUserActual);
//         }
//         return res.ok;
//       }
//     ).catch(this.handleError);
//   }

//   authorizeGoogleCalendar(): Observable<GoogleAuth> {
//     return this.http.get(this.url + '/google_calendars/authorize', this.defaultOptions()).map(
//       res => res.json()
//     ).catch(this.handleError);
//   }

//   createGoogleCalendar(token: string): Observable<Google> {
//     let body = JSON.stringify({code: token});
//     return this.http.post(this.url + '/google_calendars', body, this.defaultOptions()).map(
//       res => res.json().google
//     ).catch(this.handleError);
//   }

//   getGoogleCalendar(): Observable<Google> {
//     return this.http.get(this.url + '/google_calendars/calendars', this.defaultOptions()).map(
//       res => res.json().google
//     ).catch(this.handleError);
//   }

//   selectGoogleCalendar(form: GoogleCalendarForm): Observable<boolean> {
//     let body = JSON.stringify(form);
//     return this.http.post(this.url + '/google_calendars/select', body, this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

//   removeGoogleCalendar(): Observable<boolean> {
//     return this.http.delete(this.url + '/google_calendars/destroy', this.defaultOptions()).map(
//       res => res.ok
//     ).catch(this.handleError);
//   }

  private defaultOptions() : RequestOptions {
    let headers = new HttpHeaders({
	    'Content-Type': 'application/json'
	  });
    return {headers: headers};
  }

  private currentUserId() : number {
    let token = tokenGetter();
    return token !== null ? this.jwtHelper.decodeToken(token).sub : -1;
  }

  private getCurrentUser() {
    this.http.get<User>(this.url + '/users/' + this.currentUserId() + '/extra', this.defaultOptions()).pipe(
      catchError(this.handleError)
    ).subscribe(this._currentUser);
  }

//   private setCurrentUserSeasons(seasons: Array<Season>) {
//     this._currentUserSeasons = seasons;
//   }

//   private setCurrentUserRoles(roles: Array<Role>) {
//     this._currentUserRoles = roles;
//   }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error);
    } else {
        console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
	  return throwError(() => new Error(error.error || 'Server Error'));
  }

}
