import { Component, OnInit } from "@angular/core";
import { faGear, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import { BakerApiService, User } from "src/app/shared/services/baker-api.service";

@Component({
    selector: 'baker-cpr-refresher',
    templateUrl: 'cpr-refresher.component.html'
})
export class CprRefresherComponent implements OnInit {
  public token: string | null;
  public icons = {gear: faGear, triangle: faTriangleExclamation};

  constructor(private _api: BakerApiService) {}

  ngOnInit() {
    this._api.currentUser.subscribe({
        next: (u: User) => this.token = u.cpr_token
    });
  }
}