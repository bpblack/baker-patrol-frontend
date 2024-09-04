import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faCircleCheck, faCircleInfo, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { finalize, forkJoin } from 'rxjs';
import { BakerApiService, Classroom, CprClass, CprYear, User, hasRole } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

@Component({
  selector: 'baker-cpr-settings',
  templateUrl: './cprsettings.component.html'
})
export class CprSettingsComponent {
  public disable = {classroom: false, initialize: false};
  public error: string | null = null;
  public success: string | null = null;
  public initError: string | null = null;
  public cprLatest: CprYear;
  public classrooms: Classroom[];
  public curYear = new Date().getFullYear();
  public icons = {gear: faGear, info: faCircleInfo, tri: faTriangleExclamation, ok: faCircleCheck}

  public addClassroomForm: FormGroup = this._fb.group({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    map_link: new FormControl('', [Validators.required, Validators.pattern(urlRegex)])
  });

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    forkJoin({cy: this._api.getCprYearLatest(), crs: this._api.getClassrooms()}).subscribe({
      next: (r: {cy: CprYear, crs: Classroom[]}) => {
        if (r.cy === null) {
          this.cprLatest = {id: 0, year: "", expired: true};
        } else {
          this.cprLatest = r.cy;
        }
        this.classrooms = r.crs;
      }
    });
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  styleControl(a: AbstractControl, ct: string = 'form-control') {
    return styleControl(a, false, ct);
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
    this.disable.classroom = true;
    this._api.addClassroom(this.addClassroomForm.value).pipe(
      finalize(() => this.disable.classroom = false)
    ).subscribe({
      next: (c: Classroom) => {
        this.success = 'Added classroom ' + c.name + ' @ ' + c.address;
        this.addClassroomForm.reset();
        this.classrooms.push(c);
      },
      error: (e: Error) => this.error = e.message
    })
  }

  clearInitError() {
    this.initError = null;
  }

  onInitializeCpr() {
    this.disable.initialize = true;
    this._api.initializeCprYear().pipe(
      finalize(() => this.disable.initialize = false)
    ).subscribe({
      next: (cy: CprYear) => {
        this.cprLatest = cy;
      },
      error: (e: Error) => this.initError = e.message
    });
  }
}
