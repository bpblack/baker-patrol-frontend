import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ModalDirective} from 'ng2-bootstrap/ng2-bootstrap';
import {BakerApiService} from '../services/baker-api.service';
import {validateIdSelection} from '../validations/validations';
import {BakerApiError} from './error.component';
import {CreateAssignSubForm} from './create_assign_sub_form.component';
import {AssignSubForm} from './assign_sub_form.component';

class ModalState {
  private _index: number;
  private _patrolId: number;
  private _patrolName: string;
  private _hasSubs: boolean;
  private _hasPending: boolean;

  constructor(index: number = -1, patrolId: number = 0, patrolName: string = '', hasSubs: boolean = false, hasPending: boolean = false) {
    this._index = index;
    this._patrolId = patrolId;
    this._patrolName = patrolName;
    this._hasSubs = hasSubs;
    this._hasPending = hasPending;
  }
  get index() { return this._index; }
  get patrolId() { return this._patrolId; }
  get patrolName() { return this._patrolName; }
  get hasSubs() { return this._hasSubs; }
  get hasPending() { return this._hasPending; }
}

@Component({
  selector: 'baker-patrol-duty-day',
  templateUrl: 'app/views/duty_day.component.html'
})
export class DutyDayComponent implements OnInit {
  dutyDay: any;
  isAdmin: boolean;
  history: Array<any>;
  error: string;

  modalState: ModalState;

  @ViewChild('managePatrolModal') public managePatrolModal: ModalDirective;

  constructor(private _apiService: BakerApiService, private _route: ActivatedRoute) {}

  ngOnInit() {
    this.modalState = new ModalState();

    //get the duty day patrols
    //also check if current user is an admin
    this.updateDutyDay(() => {
        this._apiService.findRoles('admin', 'leader').subscribe(
          role => {
            if (!this.isAdmin && this.isRoleAdmin(role)) {
             this.isAdmin = true;
            }
          },
          err => {}
        );
      }
    );
  }

  showManagePatrolModal(index: number, patrolId: number, patrolName: string, hasSubs: boolean, hasPending: boolean) {
    this.modalState = new ModalState(index, patrolId, patrolName, hasSubs, hasPending);
    this.error = '';
    if (hasSubs) {
      this.updateSubHistory(patrolId, () => {
        let id = this.history[0].sub.id;
      });
    }
    this.managePatrolModal.show();
    
  }

  closeManagePatrolModal() {
    this.history = null;
    this.managePatrolModal.hide();
  }
  
  onSubRequestAssignSubmit($event) {
    this.dutyDay.patrols[this.modalState.index].has_substitutions = true;
    this.dutyDay.patrols[this.modalState.index].has_pending_substitutions = true;
    this.closeManagePatrolModal();
  }

  onSubAssign($event) {
    console.log("assigned sub " + JSON.stringify($event));
    this.managePatrolModal.hide();
  }

  onSubAssignError($event) {
    console.log("assignment error " + JSON.stringify($event));
    this.error = $event.error;
  }

  private updateDutyDay(lambda  = ()=>{}) {
    this._route.params.forEach((params: Params) => {
      let id = +params['id'];
      this._apiService.dutyDay(id).subscribe(
        dd => this.dutyDay = dd,
        err => {},
        lambda
      );
    });
  }

  private updateSubHistory(patrolId: number, lambda = ()=>{}) {
    this._apiService.getSubHistory(patrolId).subscribe(
      history => this.history = history,
      err=>{},
      lambda
    );
  }

  private isRoleAdmin(role: any) : boolean {
    if (role) {
      if (role.role === 'leader') {
        return role.season_id == this.dutyDay.season_id && role.team_id == this.dutyDay.team.id;
      } else if (role.role === 'admin') {
        return true;
      }
    }
    return false;
  }

}

