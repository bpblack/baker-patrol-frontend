import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-duty-day',
  templateUrl: 'app/views/duty_day.component.html'
})

export class DutyDayComponent implements OnInit {
  dutyDay: Object;

  constructor(private _apiService: BakerApiService, private _route: ActivatedRoute) {}

  ngOnInit() {
    //get the current user's patrols
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      this._apiService.dutyDay(id).subscribe(
        success => { this.dutyDay = success }
        //error => {}  
      );
    });
  }

  get diagnostic() { return JSON.stringify(this.dutyDay); }

}

