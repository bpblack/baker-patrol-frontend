import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {BakerApiService} from '../services/baker-api.service';

@Component({
  selector: 'baker-patrol-patrols',
  templateUrl: 'app/views/patrols.component.html',
  directives: [RouterLink]
})

export class PatrolsComponent implements OnInit {
  patrols: Array<Object>;

  constructor(private _apiService: BakerApiService, private _router: Router) {}

  ngOnInit() {
    //get the current user's patrols
    this._apiService.patrols().subscribe(
      success => { this.patrols = success }
      //error => {}  
    );
  }

  get diagnostic() { return JSON.stringify({'patrols': this.patrols}); }

}


