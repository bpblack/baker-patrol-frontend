import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BakerApiService, Classroom, CprClass, CprSignup } from '../shared/services/baker-api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription, concatMap, finalize, interval, of, switchMap, timer } from 'rxjs';
import { faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { styleControl } from '../shared/validations/validations';
import { AlertModule } from 'ngx-bootstrap/alert';

@Component({
    selector: 'baker-cpr-signup-form',
    imports: [FontAwesomeModule, ReactiveFormsModule, AlertModule],
    templateUrl: './cpr-signup-form.component.html',
    standalone: true,
})
export class CprSignupFormComponent implements OnInit, OnDestroy {
  public cprSignup: CprSignup;
  public submitted: boolean = false;
  public error: string | null = null;
  public success: string | null = null;
  public year = new Date().getFullYear();
  public currentClass: string | null = null;
  private classroomIds = new Set<number>();
  public classrooms = new Array<Classroom>();
  public classes = new Map<string, CprClass>();
  public icons = {gear: faGear, tri: faTriangleExclamation, ok: faCircleCheck};

  public signupForm: FormGroup = this._fb.group({
    cpr_class_id: new FormControl('', [Validators.required]),
  });

  private _poll: Subscription;
  @Input() token: string;

  constructor(private _api: BakerApiService, private _route: ActivatedRoute, private _fb: FormBuilder) {}

  ngOnInit() {
    var sub = (s: CprSignup) => {
      this.cprSignup = s;
      var curCprClassId = this.cprSignup.student.cpr_class_id;
      this.cprSignup.classes.forEach((c: CprClass) => {
        if (!this.classroomIds.has(c.classroom.id)) {
          this.classroomIds.add(c.classroom.id);
          this.classrooms.push(c.classroom);
        }
        this.classes.set(c.id.toString(), c);
        if (curCprClassId !== null && curCprClassId === c.id) {
          this.currentClass = c.classroom.name + ' @ ' + c.time;
        }
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
    };
    
    this._poll = timer(0, 60000).pipe(
      switchMap(() => {
        return this._api.getCprSignup(this.token!);
      })
    ).subscribe({
      next: (s: CprSignup | null) => {
        if (s !== null) {
          sub(s);
        }
      },
      error: (e: Error) => this.error = e.message
    })
  }

  ngOnDestroy() {
    this._poll.unsubscribe()
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  onSignup() {
    this.submitted = true; 
    this._api.changeCprSignup(this.token!, this.signupForm.value).pipe(
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
          this.currentClass = c.classroom.name + ' @ ' + c.time;
          this.success = 'Successfully signed up for ' + this.currentClass;
          this.cprSignup.student.cpr_class_id = c.id;
          var newClass = this.classes.get(c.id.toString());
          if (newClass !== undefined) {
            newClass.students_count = newClass.students_count! + 1;
          }
        } else {
          this.currentClass = null;
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
