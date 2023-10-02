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
  public searchTerm: string = '';
  public error: string | null = null;
  public disable: boolean = false;
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;

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
        this.cprClassMap = new Map<number, string>(this.cprClasses.map(c => [c.id, c.time + ' @ ' + c.location]))
      })  
    ).subscribe({
      next: (r: {c: CprClass[], s: CprStudent[]}) => {
        this.cprClasses = r.c;
        this.cprStudents = r.s;
      },
      error: (e: Error) => this.error = e.message
    })
  }

  getClassName(id: number | null) {
    return id === null ? "Unregistered" : this.cprClassMap.get(id);
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
