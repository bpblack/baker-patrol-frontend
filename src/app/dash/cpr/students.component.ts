import { Component } from '@angular/core';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-cpr-students',
  templateUrl: './students.component.html'
})
export class StudentsComponent {
  constructor(private _api: BakerApiService) {}
}
