import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faCheck, faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, concatMap, finalize, forkJoin, of, switchMap, timer } from 'rxjs';
import { BakerApiService, Classroom, CprClass, CprStudent, CprYear, User, hasRole } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

const isPast: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const now = new Date();
  const v = Date.parse(c.value);
  return (!v || c.value < now) ? { invalidDate: true } : null;
} 

@Component({
    selector: 'baker-cpr-class',
    templateUrl: './cprclasses.component.html',
    standalone: false
})
export class CprClassesComponent {
  public selected: number = 0;
  public cprYear: CprYear;
  public cprClasses: CprClass[];
  public cprClassrooms: Classroom[];
  public error: string | null = null;
  public success: string | null = null;
  public resize: FormGroup;
  public editClass: boolean = false;
  public cprAdmin: boolean = false;
  public disable: boolean = false;// {resized: false, added: false};
  public icons = {gear: faGear, check: faCheck, tri: faTriangleExclamation, ok: faCircleCheck};

  public addClassRef: BsModalRef;
  @ViewChild('addClassModal') addClass: any;

  public addClassForm: FormGroup = this._fb.group({
    classroom_id: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required, isPast]),
    class_size: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")])
  });

  private _poll: Subscription;
  
  constructor(private _api: BakerApiService, private _modal: BsModalService, private _fb: FormBuilder) {}

  ngOnInit() {
    this._api.currentUser.pipe(
      concatMap((u: User) => {
        this.cprAdmin = hasRole(u.roles, new Set(['admin', 'cprior']));
        return this.cprAdmin ? this._api.getClassrooms() : of(<Classroom[]>[])
      })
    ).subscribe({
      next: (ca: Classroom[]) => this.cprClassrooms = ca
    });

    this._poll = timer(0, 60000).pipe(
      switchMap(() => forkJoin({y: this._api.getCprYearLatest(), cs: this._api.getCprClasses(true)}))
    ).subscribe({
      next: (r: {y: CprYear, cs: CprClass[]}) => {
        this.cprYear = r.y ? r.y : {id: 0, year: "", expired: true};
        this.cprClasses = r.cs;
      },
      error: (e: Error) => {
        this.error = e.message
      }
    });
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  getClassTitle(i: number) {
    const c = this.cprClasses[i];
    return `${c.time} @ ${c.classroom.name} (Enrollment: ${c.students_count}/${c.class_size})`
  }

  selectClass(value: any) {
    this.selected = value.target.value;
    const cur = this.cprClasses[this.selected];
  }

  classMailLink() {
    if (this.cprClasses.length && this.cprClasses[this.selected].students && this.cprClasses[this.selected].students!.length > 0) {
      return 'mailto:?bcc=' + this.cprClasses[this.selected].students!.map((s: CprStudent) => s.email).join(','); 
    } else {
      return '';
    }
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  getAddClass(name: string): AbstractControl {
    return this.addClassForm.controls[name];
  }

  styleControl(a: AbstractControl, ct: string = 'form-control') {
    return styleControl(a, false, ct);
  }

  showAddClass() {
    if (!this.cprAdmin) return;
    this.addClassRef = this._modal.show(this.addClass, {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'});
  }

  showEditClass() {
    if (!this.cprAdmin) return;
    this.editClass = true;
    const selected: CprClass = this.cprClasses[this.selected];
    this.addClassForm.controls['classroom_id'].setValue(String(selected.classroom.id));
    this.addClassForm.controls['time'].setValue(new Date(selected.time));
    this.addClassForm.controls['class_size'].setValue(selected.class_size);
    this.addClassRef = this._modal.show(this.addClass, {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'});
  }

  onAddClass() {
    if (!this.cprAdmin) return;
    this.disable = true;
    if (this.editClass){
      let cur = this.cprClasses[this.selected];
      this._api.editCprClass(cur.id, this.addClassForm.value).pipe(
        finalize(() => {
          this.disable = false;
        })
      ).subscribe({
        next: (c: CprClass) => {
          cur.classroom.id = c.classroom.id;
          cur.classroom.name = c.classroom.name;
          cur.class_size = c.class_size;
          cur.time = c.time;
          this.success = 'Updated to ' + cur.classroom.name + ' @ ' + c.time + ' with a class size of ' + cur.class_size!;
          this.clearError();
        },
        error: (e: Error) => {
          this.clearSuccess();
          this.error = e.message;
        }
      });
    } else {
      this._api.addCprClass(this.addClassForm.value).pipe(
        finalize(() => {
          this.disable = false;
        })
      ).subscribe({
        next: (c: CprClass) => {
          this.cprClasses.splice(this.cprClasses.findIndex((cur: CprClass) => {
            const nd = Date.parse(c.time)
            const cd = Date.parse(cur.time)
            return nd <= cd;
          }), 0, c);
          this.addClassForm.reset();
          this.success = 'Added ' + c.classroom.name + ' @ ' + c.time + ' with a class size of ' + c.class_size!;
          this.clearError();
        }, 
        error: (e: Error) => {
          this.clearSuccess();
          this.error = e.message;
        }
      });
    }
  }

  hideAddClass() {
    this.addClassRef.hide();
    this.addClassForm.reset();
    this.success = null;
    this.error = null;
  }
}
