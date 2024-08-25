import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { concatMap, finalize, forkJoin, of } from 'rxjs';
import { BakerApiService, Classroom, CprClass, CprYear, User, hasRole } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

const isPast: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const now = new Date();
  const v = Date.parse(c.value);
  return (!v || c.value < now) ? { invalidDate: true } : null;
}

@Component({
  selector: 'baker-cpr-settings',
  templateUrl: './cprsettings.component.html'
})
export class CprSettingsComponent {
  public disable = {classroom: false, initialize: false};
  public error: string | null = null;
  public success: string | null = null;
  public initError: string | null = null;
  public initSuccess: string | null = null;
  public cprLatest: CprYear;
  public classrooms: Classroom[];
  public curYear = new Date().getFullYear();
  public icons = {gear: faGear, tri: faTriangleExclamation, ok: faCircleCheck}

  public addClassroomForm: FormGroup = this._fb.group({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    map_link: new FormControl('', [Validators.required, Validators.pattern(urlRegex)])
  });

  public addClassForm: FormGroup = this._fb.group({
    classroom_id: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required, isPast]),
    class_size: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")])
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

  clearInitSuccess() {
    this.initSuccess = null;
  }

  onInitializeCpr() {
    this.disable.initialize = true;
    this._api.initializeCprYear().pipe(
      finalize(() => this.disable.initialize = false)
    ).subscribe({
      next: (cy: CprYear) => {
        this.cprLatest = cy;
        this.initSuccess = 'Initialized CPR for ' + this.curYear;
      },
      error: (e: Error) => this.initError = e.message
    });
  }

  getAddClass(name: string): AbstractControl {
    return this.addClassForm.controls[name];
  }

  onAddClass() {
    this.disable.initialize = true;
    this._api.addCprClass(this.addClassForm.value).pipe(
      finalize(() => this.disable.initialize = false)
    ).subscribe({
      next: (c: CprClass) => {
        this.addClassForm.reset();
        this.initSuccess = 'Added ' + c.location + ' @ ' + c.time + ' with a class size of ' + c.class_size!;
      }, 
      error: (e: Error) => this.initError = e.message
    });
  }
}
