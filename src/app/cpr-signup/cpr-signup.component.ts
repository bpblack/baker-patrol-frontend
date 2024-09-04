import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { IconDefinition, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CprSignupFormComponent } from './cpr-signup-form.component';

@Component({
  selector: 'baker-cpr-signup',
  standalone: true,
  imports: [CprSignupFormComponent, FontAwesomeModule],
  templateUrl: './cpr-signup.component.html'
})
export class CprSignupComponent implements OnInit {
  public token: string;
  public gear: IconDefinition = faGear;

  constructor(private _route: ActivatedRoute) {}

  ngOnInit() {
    this._route.params.subscribe({
      next: (p: Params) => this.token = p['id']
    });
  }
}
  