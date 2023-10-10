import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faCheck, faCircleCheck, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { concatMap, finalize, of } from 'rxjs';
import { BakerApiService, Classroom, CprClass, CprStudent, User, hasRole } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

function classSizeValidator(val: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const cmp: number = +c.value;
    return (cmp && cmp < val) ? { sizeTooSmall: true } : null; 
  }
}

const isPast: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const now = new Date();
  const v = Date.parse(c.value);
  return (!v || c.value < now) ? { invalidDate: true } : null;
} 

@Component({
  selector: 'baker-cpr-class',
  templateUrl: './cprclasses.component.html'
})
export class CprClassesComponent {
  public selected: number = 0;
  public cprClasses: CprClass[];
  public cprClassrooms: Classroom[];
  public error: string | null = null;
  public success: string | null = null;
  public resize: FormGroup;
  public cprAdmin: boolean = false;
  public disable = {resized: false, added: false};
  public icons = {gear: faGear, check: faCheck, tri: faTriangleExclamation, ok: faCircleCheck};

  public addClassRef: BsModalRef;
  @ViewChild('addClassModal') addClass: any;

  public addClassForm: FormGroup = this._fb.group({
    classroom_id: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required, isPast]),
    class_size: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")])
  });
  
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

    this._api.getCprClasses(true).pipe(
      finalize(() => {
        const cur = this.cprClasses[this.selected];
        this.resize = this._fb.group({
          size: new FormControl(cur.class_size, [Validators.required, Validators.pattern("^[0-9]+$"), classSizeValidator(cur.students_count!)])
        });
      })
    ).subscribe({
      next: (c: CprClass[]) => this.cprClasses = c,
      error: (e: Error) => this.error = e.message
    })
  }

  getClassTitle(i: number) {
    const c = this.cprClasses[i];
    return `${c.time} @ ${c.location} (Enrollment: ${c.students_count}/${c.class_size})`
  }

  selectClass(value: any) {
    this.selected = value.target.value;
    const cur = this.cprClasses[this.selected];
    this.resize.controls['size'].setValue(cur.class_size);
    this.resize.controls['size'].clearValidators();
    this.resize.controls['size'].setValidators([Validators.required, Validators.pattern("^[0-9]+$"), classSizeValidator(cur.students_count!)]);
    this.resize.controls['size'].markAsPristine();
  }

  classMailLink() {
    return 'mailto:?bcc=' + this.cprClasses[this.selected].students!.map((s: CprStudent) => s.email).join(',');
  }

  get size(): number {
    return +this.resize.controls['size'].value;
  }

  onResize() {
    if (!this.cprAdmin) return;
    this.disable.resized = true;
    const vals = this.resize.value;
    let cur = this.cprClasses[this.selected];
    this._api.resizeCprClass(cur.id, this.resize.value).pipe(
      finalize(() => {
        this.disable.resized = false;
        this.resize.controls['size'].markAsPristine();
      })
    ).subscribe({
      next: (b: boolean) => cur.class_size = +vals.size,
      error: (e: Error) => this.error = e.message
    });
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.success = null;
  }

  get newSize() {
    return this.resize.controls['size'];
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

  onAddClass() {
    if (!this.cprAdmin) return;
    this.disable.added = true;
    this._api.addCprClass(this.addClassForm.value).pipe(
      finalize(() => this.disable.added = false)
    ).subscribe({
      next: (c: CprClass) => {
        this.cprClasses.splice(this.cprClasses.findIndex((cur: CprClass) => {
          const nd = Date.parse(c.time)
          const cd = Date.parse(cur.time)
          return nd <= cd;
        }), 0, c);
        this.addClassForm.reset();
        this.success = 'Added ' + c.location + ' @ ' + c.time + ' with a class size of ' + c.class_size!;
      }, 
      error: (e: Error) => this.error = e.message
    });
  }

  hideAddClass() {
    this.addClassRef.hide();
    this.addClassForm.reset();
  }
}
