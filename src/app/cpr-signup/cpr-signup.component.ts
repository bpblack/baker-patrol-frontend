import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BakerApiService, Classroom, CprClass, CprSignup } from '../shared/services/baker-api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { concatMap, finalize } from 'rxjs';
import { faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { styleControl } from '../shared/validations/validations';
import { AlertModule } from 'ngx-bootstrap/alert';

@Component({
  selector: 'baker-cpr-signup',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, AlertModule],
  templateUrl: './cpr-signup.component.html'
})
export class CprSignupComponent {
  private _token: string;
  public cprSignup: CprSignup;
  public submitted: boolean = false;
  public error: string | null = null;
  public success: string | null = null;
  public year = new Date().getFullYear();
  private classroomIds = new Set<number>();
  public classrooms = new Array<Classroom>();
  public classes = new Map<string, CprClass>();
  public icons = {gear: faGear, tri: faTriangleExclamation, ok: faCircleCheck};

  public signupForm: FormGroup = this._fb.group({
    cpr_class_id: new FormControl('', [Validators.required]),
  });

  constructor(private _api: BakerApiService, private _route: ActivatedRoute, private _fb: FormBuilder) {}

  ngOnInit() {
    this._route.params.pipe(
      concatMap((p: Params) => {
        this._token = p['id'];
        return this._api.getCprSignup(this._token);
      })
    ).subscribe({
      next: (s: CprSignup) => {
        this.cprSignup = s;
        this.cprSignup.classes.forEach((c: CprClass) => {
          if (!this.classroomIds.has(c.classroom.id)) {
            this.classroomIds.add(c.classroom.id);
            this.classrooms.push(c.classroom);
          }
          this.classes.set(c.id.toString(), c);
        });
        this.classrooms.sort((a: Classroom, b: Classroom) => (a.name > b.name ? -1 : 1));
        this.signupForm.controls['cpr_class_id'].setValue(this.cprSignup.student.cpr_class_id ? this.cprSignup.student.cpr_class_id.toString() : '0');
        const isDifferent: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
          let curid = this.cprSignup.student.cpr_class_id;
          if (curid === null) {
            curid = 0;
          }
          return (curid.toString() === c.value) ? { alreadySelected: true } : null;
        };
        this.signupForm.controls['cpr_class_id'].addValidators(isDifferent);
      },
      error: (e: Error) => this.error = e.message
    });
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  onSignup() {
    this.submitted = true; 
    this._api.changeCprSignup(this._token, this.signupForm.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: (r: boolean) => {
        var c = this.classes.get(this.signupForm.controls['cpr_class_id'].value);
        var curClassId = this.cprSignup.student.cpr_class_id;
        if (curClassId !== null) {
          var curClass = this.classes.get(curClassId.toString());
          if (curClass !== undefined) {
            curClass.students_count = curClass.students_count!-1;
          }
        }
        if (c !== undefined) {
          this.success = 'Successfully signed up for ' + c.classroom.name + ' @ ' + c.time;
          this.cprSignup.student.cpr_class_id = c.id;
          var newClass = this.classes.get(c.id.toString());
          if (newClass !== undefined) {
            newClass.students_count = newClass.students_count! + 1;
          }
        } else {
          this.success = 'Successfully unregistered.'
          this.cprSignup.student.cpr_class_id = null;
        }
        this.clearError();
      },
      error: (e: Error) => {
        this.error = e.message;
        this._api.log(e.message);
        this.clearSuccess();
      }
    });
  }

  styleControl(ct: string = 'form-control') {
    return styleControl(this.signupForm.controls['cpr_class_id'], false, ct);
  }

  disabled(id: number) {
    var cmp: Number | null = this.cprSignup.student.cpr_class_id;
    var klass: CprClass | undefined = this.classes.get(id.toString());
    if (cmp === null) {
      cmp = 0;
    }
    var isPast: boolean = false;
    const now = Date.now();
    return id === cmp || (klass && (Date.parse(klass?.time) < now || klass.class_size! <= klass.students_count!));
  }

  selected(id: number) {
    return this.signupForm.controls['cpr_class_id'].value === id;
  }
  
}
