import { Component, ViewChild } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { finalize, forkJoin } from 'rxjs';
import { BakerApiService, CprClass, CprStudent } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-cpr-students',
  templateUrl: './students.component.html',
  providers: [{provide: BsDropdownConfig, useValue: {isAnimated: true, autoClose: true}}]
})
export class StudentsComponent {
  public cprClasses: CprClass[];
  public cprStudents: CprStudent[];
  public cprClassMap: Map<number, string>;
  public cprStudentMap: Map<number, CprStudent>;
  public searchTerm: string = '';
  public error: string | null = null;
  public disable: boolean = false;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  public classNameFn: (i: number | null, m: Map<number, string>) => string = StudentsComponent.getClassNameS;

  // modals
  public addStudentRef: BsModalRef;
  public sendRemindersRef: BsModalRef;
  private _mOpts: ModalOptions = {animated: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'};
  @ViewChild('addStudentModal') addStudent: any;
  @ViewChild('sendRemindersModal') sendReminders: any;


  constructor(private _api: BakerApiService, private _modal: BsModalService) {}

  ngOnInit() {
    forkJoin({c: this._api.getCprClasses(), s: this._api.getCprStudents()}).pipe(
      finalize(() => {
        this.cprClassMap = new Map<number, string>(this.cprClasses.map(c => [c.id, c.time + ' @ ' + c.location]));
        this.cprStudentMap = new Map<number, CprStudent>(this.cprStudents.map(s => [s.id, s]));
      })  
    ).subscribe({
      next: (r: {c: CprClass[], s: CprStudent[]}) => {
        this.cprClasses = r.c;
        this.cprStudents = r.s;
      },
      error: (e: Error) => this.error = e.message
    })
  }

  getClassName(id: number | null): string {
    return this.classNameFn(id, this.cprClassMap);//id === null ? "Unregistered" : this.cprClassMap.get(id)!;
  }

  static getClassNameS(id: number | null, cm: Map<number, string>) {
    return id === null ? "Unregistered" : cm.get(id)!;
  }

  showAddStudent() {
    this.addStudentRef = this._modal.show(this.addStudent, this._mOpts);
  }

  hideAddStudent() {
    this.addStudentRef.hide();
  }

  showSendReminders() {
    this.sendRemindersRef = this._modal.show(this.sendReminders, this._mOpts)
  }

  hideSendReminders() {
    this.sendRemindersRef.hide();
  }
}
