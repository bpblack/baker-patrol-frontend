import { Component } from '@angular/core';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { BakerApiService, User } from 'src/app/shared/services/baker-api.service';

@Component({
    selector: 'baker-account',
    templateUrl: './account.component.html',
    standalone: false
})
export class AccountComponent {
  public user: Observable<User>;
  public igear: IconDefinition = faGear;

  constructor(private _api: BakerApiService) {}

  ngOnInit() {
    this.user = this._api.currentUser;
  }
}
