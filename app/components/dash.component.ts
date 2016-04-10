import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {BakerApiService} from '../services/baker-api.service';


@Component({
    selector: 'baker-patrol-dash',
    templateUrl: 'app/views/dash.component.html',
    directives: [RouterLink]
})

export class DashComponent {
    constructor(private _apiService: BakerApiService, private _router: Router) {}
    
    logout() {
        this._apiService.logout();
    }
}

