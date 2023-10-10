import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService, Classroom } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

@Component({
  selector: 'baker-cpr-settings',
  templateUrl: './cprsettings.component.html'
})
export class CprSettingsComponent {
  public disable: boolean = false;
  public error: string | null = null;
  public success: string | null = null;
  public icons = {gear: faGear, tri: faTriangleExclamation, ok: faCircleCheck}

  public addClassroomForm: FormGroup = this._fb.group({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    map_link: new FormControl('', [Validators.required, Validators.pattern(urlRegex)])
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  styleControl(a: AbstractControl) {
    return styleControl(a);
  }

  get classroomName() {
    return this.addClassroomForm.controls['name'];
  }

  get classroomAddress() {
     return this.addClassroomForm.controls['address'];
  }

  get classroomLink() {
    return this.addClassroomForm.controls['map_link'];
  }

  onAddClassroom() {
    this.disable = true;
    this._api.addClassroom(this.addClassroomForm.value).pipe(
      finalize(() => this.disable = false)
    ).subscribe({
      next: (c: Classroom) => {
        this.success = 'Added classroom ' + c.name + ' @ ' + c.address;
        this.addClassroomForm.reset();
      },
      error: (e: Error) => this.error = e.message
    })
  }

}
