import {Component, OnInit} from '@angular/core';
import {Router, RouteParams} from '@angular/router-deprecated';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-duty-day',
  templateUrl: 'app/views/duty_day.component.html'
})

export class DutyDayComponent implements OnInit {
  dutyDay: Object;

  constructor(private _apiService: BakerApiService, private _router: Router, private _routeParams: RouteParams) {}

  ngOnInit() {
    //get the current user's patrols
    this._apiService.dutyDay(+this._routeParams.get('id')).subscribe(
      success => { this.dutyDay = success }
      //error => {}  
    );
  }

  get diagnostic() { return JSON.stringify(this.dutyDay); }

}

