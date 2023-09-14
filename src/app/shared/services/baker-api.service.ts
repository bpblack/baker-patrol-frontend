import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, throwError, ReplaySubject} from 'rxjs';
import { catchError, first, map, mergeMap } from 'rxjs/operators';
import { IAuthService } from './iauth.service';
import { tokenGetter } from 'src/app/app.module';
import { environment } from 'src/environments/environment';

export interface APIError {
  error: string;
}

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
  roles?: string;
  skills?: string; //TODO change the ruby api so this is roles
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

export interface LatestSub {
  id: number;
  accepted: boolean;
  sub_id: number;
}

export interface Responsibility {
  id: number;
  name: string;
  version: string;
  role: string;
}

export interface Patrol {
  id: number;
  latest_substitution: LatestSub;
  patroller: RosterUser;
  responsibility: Responsibility;
}

export interface PatrolDutyDay {
  id: Date;
  season_id: number;
  date: string;
  team: Team;
}

export interface PatrolDetails {
  id: number;
  swapable: boolean;
  pending_substitution: SubAssignment | null;
  duty_day: PatrolDutyDay;
  responsibility: Responsibility;
}

export interface DutyDayDetail {
  season_id: number;
  date: string;
  swapable: boolean;
  team: Team;
  patrols: Patrol[];
}

export interface SubHistory {
  id: number;
  reason: string;
  accepted: boolean;
  subbed: RosterUser;
  sub: RosterUser;
}

interface SubHistoryAPI {
  sub_history: SubHistory[];
}

export interface AssignSuccess {
  sub_id: number;
}

export function isAssignSuccess(o: any): o is AssignSuccess {
  return 'sub_id' in o;
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
  id?: number;
  sub_id: number | null;
  name?: string | null;
  sub_name?: string | null;
}

export interface Substitution {
  id: number;
  date: string;
  accepted: boolean;
  reason: string;
  patrol_id: number;
  duty_day: DutyDay;
  sub?: SubAssignment;
  sub_for?: SubAssignment;
  responsibility?: Responsibility;
}

export interface Substitutions {
  requests: Substitution[];
  substitutions: Substitution[];
  timestamp: string;
}

interface AssignableUsersAPI {
  assignable_users: RosterUser[];
}

interface PatrolsAPI {
  patrols: PatrolDetails[]
}

// in use?

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

interface Available {
  emails: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BakerApiService implements IAuthService {

  private url = environment.apiUrl;
  private didLogin: boolean = false;
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private _currentUser: ReplaySubject<User>;

  constructor(private http: HttpClient) {
    this._currentUser = new ReplaySubject(1);
  }

  log(...data: any[]) {
    if (environment.production === false) console.log(data);
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

  reset(id: string, r: ResetForm) {
    let body = JSON.stringify(r);
    return this.http.patch(this.url + '/password_resets/' + id, body, this.defaultOptions()).pipe(
      map(res => true),
      catchError(this.handleError)
    );
  }

  getPatrols(seasonId: number, userId: number = this.currentUserId()) : Observable<PatrolDetails[]> {
    return this.http.get<PatrolsAPI>(this.url + '/users/' + userId + '/seasons/' + seasonId + '/patrols', this.defaultOptions()).pipe(
      map(res => res.patrols),
      catchError(this.handleError)
    );
  }

  getDutyDay(dutyDayId: number): Observable<DutyDayDetail>  {
    return this.http.get<DutyDayDetail>(this.url + '/duty_days/' + dutyDayId, this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

  getSeasonDutyDays(seasonId: number): Observable<DutyDay[]> {
    return this.http.get<DutyDay[]>(this.url + '/seasons/' + seasonId + '/duty_days', this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

  getSeasonRoster(seasonId: number) : Observable<TeamRoster[]> {
    return this.http.get<SeasonRoster>(this.url + '/seasons/' + seasonId + '/roster', this.defaultOptions()).pipe(
      map(r => r.roster),
      catchError(this.handleError)
    );
  }

  swapResponsibilities(patrolId: number, s: SwapForm): Observable<boolean> {
    return this.http.patch(this.url + '/patrols/' + patrolId + '/swap', s, this.defaultOptions()).pipe(
      map(res => true),
      catchError(this.handleError)
    );
  }

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

  createSubAssignRequest(patrolId: number, cs: AssignForm) : Observable<SubAssignment> {
    let body = JSON.stringify(cs);
    return this.http.post<SubAssignment>(this.url + '/patrols/' + patrolId + '/substitutions', body, this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

  getAssignableUsers(patrolId: number) : Observable<RosterUser[]> {
    return this.http.get<AssignableUsersAPI>(this.url + '/patrols/' + patrolId + '/assignable', this.defaultOptions()).pipe(
      map(res => res.assignable_users),
      catchError(this.handleError)
    );
  }

  assignSubRequest(substitutionId: number, a: AssignForm) : Observable<SubAssignment> {
    return this.http.patch<SubAssignment>(this.url + '/substitutions/' + substitutionId + '/assign', a, this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

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

  getSubstitutions(seasonId:number, params: string[][], userId: number = this.currentUserId()) : Observable<Substitutions> {
    let paramsStr = '';
    for (let pair of params) {
      paramsStr += paramsStr.length === 0 ? '?' : '&';
      paramsStr += pair[0] + '=' + pair[1];
    }
    return this.http.get<Substitutions>(this.url + '/users/' + userId + '/seasons/' + seasonId + '/substitutions' + paramsStr, this.defaultOptions()).pipe(
      catchError(this.handleError)
    );
  }

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

  getSubHistory(id: number) : Observable<SubHistory[]> {
    return this.http.get<SubHistoryAPI>(this.url + '/admin/patrols/' + id + '/substitutions', this.defaultOptions()).pipe(
      map(sh => sh.sub_history),
      catchError(this.handleError)
    );
  }
  
  getAvailablePatrollers(id: number) : Observable<string[]> {
    return this.http.get<Available>(this.url + '/admin/duty_days/' + id + '/available_patrollers', this.defaultOptions()).pipe(
      map(e => e.emails),
      catchError(this.handleError)
    );
  }

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
	  return throwError(() => new Error(error.message || 'Server Error'));
  }

}
