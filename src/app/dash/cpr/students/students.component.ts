import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { faAt, faCheck, faCircleCheck, faCircleInfo, faGear, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription, finalize, forkJoin, switchMap, timer } from 'rxjs';
import { BakerApiService, CprClass, CprStudent, CprYear, User, hasRole } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

function cprClassValidator(id: number | null): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    return c.value !== id ? null : {validateIdSelection: false};
  }
}

interface StudentMessages {
  main: string | null;
  add: string | null;
  remind: string | null;
}

@Component({
  selector: 'baker-cpr-students',
  templateUrl: './students.component.html',
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]
})
export class StudentsComponent {
  public cprYear: CprYear;
  public cprClasses: CprClass[];
  public cprStudents: CprStudent[];
  public cprClassMap: Map<number, string>;
  public cprStudentMap: Map<number, CprStudent>;
  public searchTerm: string = '';
  public cprAdmin: boolean = false;
  public showRemove: boolean = false;
  public error: StudentMessages = {main: null, add: null, remind: null};
  public success: StudentMessages = {main: null, add: null, remind: null};
  public disable = {added: false, removed: false, reminded: false, changed: false }
  public showChange: {b: boolean, s: CprStudent | null, idx: number | null} = {b: false, s: null, idx: null};
  public icons = {at: faAt, info: faCircleInfo, gear: faGear, check: faCheck, x: faXmark, tri: faTriangleExclamation, ok: faCircleCheck};
  public classNameFn: (i: number | null, m: Map<number, string>) => string = StudentsComponent.getClassNameS;

  // modals
  public addStudentRef: BsModalRef;
  public sendRemindersRef: BsModalRef;
  private _mOpts: ModalOptions = {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'};
  @ViewChild('addStudentModal') addStudent: any;
  @ViewChild('sendRemindersModal') sendReminders: any;

  //forms
  public addStudentForm: FormGroup = this._fb.group({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });
  public removeStudentsForm: FormGroup = this._fb.group({});
  //public changeStudentEmailForm: FormGroup;
  public changeClassForm: FormGroup;

  private _poll: Subscription;

  constructor(private _api: BakerApiService, private _modal: BsModalService, private _fb: FormBuilder) {}

  ngOnInit() {
    this._api.currentUser.subscribe({
      next: (u: User) => this.cprAdmin = hasRole(u.roles, new Set(['admin', 'cprior']))
    });

    this._poll = timer(0, 60000).pipe(
      switchMap(() => forkJoin({c: this._api.getCprClasses(), s: this._api.getCprStudents(), y: this._api.getCprYearLatest()}))
    ).subscribe({
      next: (r: {c: CprClass[], s: CprStudent[], y: CprYear}) => {
        this.cprClasses = r.c;
        this.cprStudents = r.s;
        this.cprYear = r.y ? r.y : {id: 0, year: "", expired: true};
        this.cprClassMap = new Map<number, string>(this.cprClasses.map(c => [c.id, c.time + ' @ ' + c.classroom.name]));
        this.cprStudentMap = new Map<number, CprStudent>(this.cprStudents.map(s => [s.id, s]));
      },
      error: (e: Error) => this.error.main = e.message
    });
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  getClassName(id: number | null): string {
    return this.classNameFn(id, this.cprClassMap);
  }

  static getClassNameS(id: number | null, cm: Map<number, string>) {
    return id === null ? "Unregistered" : cm.get(id)!;
  }

  get studentControls() {
    return this.addStudentForm.controls;
  }

  styleControl(c: AbstractControl) {
    return styleControl(c);
  }

  clearMainMessage(m: StudentMessages) {
    m.main = null;
  }

  showAddStudent() {
    if (!this.cprAdmin) return;
    this.addStudentRef = this._modal.show(this.addStudent, this._mOpts);
  }

  clearAddMessage(m: StudentMessages) {
    m.add = null;
  }

  onAddStudent() {
    if (!this.cprAdmin) return;
    this.disable.added = true;
    this._api.addCprStudent(this.addStudentForm.value).pipe(
      finalize(() => this.disable.added = false)
    ).subscribe({
      next: (s: CprStudent) => {
        this.cprStudents.splice(this.cprStudents.findIndex((cur: CprStudent) => {
          const sn = s.last_name + s.first_name;
          const cn = cur.last_name + cur.first_name;
          return sn.localeCompare(cn) <= 0;
        }), 0, s);
        this.cprStudentMap.set(s.id, s);
        this.success.add = 'Added new student ' + s.first_name + ' ' + s.last_name + ' => ' + s.email; 
        this.addStudentForm.reset();
        if (this.showRemove) {
          this.removeStudentsForm.addControl(s.id.toString(), new FormControl({value: false, disabled: false}));
        }
      },
      error: (e: Error) => this.error.add = e.message
    })
  }

  hideAddStudent() {
    this.addStudentRef.hide();
    this.success.add = null;
    this.error.add = null;
  }

  resetRemoveForm() {
    // reset the checkbox controls for the current list of students
    this.removeStudentsForm = this._fb.group({});
    const rcs = this.cprStudents.forEach((s: CprStudent) => {
      this.removeStudentsForm.addControl(s.id.toString(), new FormControl({value: false, disabled: s.has_cpr_cert || s.cpr_class_id !== null}));
    });
  }

  showRemoveStudents() {
    if (!this.cprAdmin) return;
    this.showRemove = true;
    this.resetRemoveForm();
  }

  onRemoveStudents() {
    if (!this.cprAdmin) return;
    this.disable.removed = true;
    const removeIds: number[] = this.cprStudents.reduce<number[]>((a: number[], s: CprStudent) => {
      if (this.removeStudentsForm.controls[s.id.toString()].value === true) {
        a.push(s.id);
      }
      return a;
    }, []);
    this._api.removeCprStudents(removeIds).pipe(
      finalize(() => this.disable.removed = false)
    ).subscribe({
      next: (b: boolean) => {
        // remove the students
        removeIds.forEach((rid: number) => {
          this.cprStudentMap.delete(rid);
          const idx = this.cprStudents.findIndex((s: CprStudent) => s.id === rid);
          if (idx >= 0) {
            this.cprStudents.splice(idx, 1);
          }
        });
        // reset the remove form
        this.resetRemoveForm()
        // reset the filter
        this.searchTerm = '';
      },
      error: (e: Error) => this.error.main = e.message
    });
  }

  hideRemoveStudents() {
    this.showRemove = false;
    this.success.main = null;
    this.error.main = null;
  }

  showSendReminders() {
    if(!this.cprAdmin) return;
    this.sendRemindersRef = this._modal.show(this.sendReminders, this._mOpts)
  }
  
  onSendReminders() {
    if (!this.cprAdmin) return;
    this.disable.reminded = true;
    this._api.sendCprReminders().pipe(
      finalize(() => this.disable.reminded = false)
    ).subscribe({
      next: (n: number) => this.success.remind = 'Scheduled ' + n + ' reminder emails to be sent.',
      error: (e: Error) => this.error.remind = e.message
    })
  }

  clearSendReminders(m: StudentMessages) {
    m.remind = null;
  }

  hideSendReminders() {
    this.sendRemindersRef.hide();
    this.success.remind = null;
    this.error.remind = null;
  }

  showChangeClass(studentId: number, idx: number) {
    if (!this.cprAdmin) return;
    this.showChange.b = true;
    this.showChange.idx = idx;
    const s = this.cprStudentMap.get(studentId);
    if (s !== undefined) {
      this.showChange.s = s;
      let class_id = s.cpr_class_id;
      if (s.has_cpr_cert) {
        class_id = 0
      }
      this.changeClassForm = this._fb.group({
        cpr_class_id: new FormControl(class_id, [cprClassValidator(class_id)])
      })
    } else {
      this.hideChangeClass();
    }
  }
  
  onChangeClass() {
    if (!this.cprAdmin) return;
    this.disable.changed = true;
    const fv = this.changeClassForm.value;
    const s: CprStudent = this.showChange.s!;
    if (fv.cpr_class_id === 'null') {
      // gets converted to a string by form, convert back to null
      fv.cpr_class_id = null;
    } else {
      // convert back to a number
      fv.cpr_class_id = +fv.cpr_class_id;
    }
    this._api.changeCprClass(s.id, this.changeClassForm.value).pipe(
      finalize(() => this.disable.changed = false)
    ).subscribe({
      next: (b: boolean) => {
        const cci = fv.cpr_class_id;
        if (cci === null) {
          if (this.showRemove) {
            this.removeStudentsForm.controls[s.id.toString()].enable();
          }
          s.cpr_class_id = null;
          s.has_cpr_cert = false;
        } else {
          if (this.showRemove) {
            let rsfc = this.removeStudentsForm.controls[s.id.toString()];
            rsfc.disable()
            rsfc.setValue(false);
          }
          if (cci === 0) {
            s.cpr_class_id = null;
            s.has_cpr_cert = true;
          } else {
            s.cpr_class_id = cci;
            s.has_cpr_cert = false;
          }
        }
        this.hideChangeClass();
      },
      error: (e: Error) => this.error.main = e.message
    });
  }

  hideChangeClass() {
    this.showChange.b = false;
    this.showChange.s = null;
    this.showChange.idx = null;
  }
}
