import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'baker-patrols-tab',
  template: `
    <div class="panel-body">
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Team</th>
              <th>Responsibility</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patrol of patrols; let i = index" [ngClass]="{'danger': patrol.pending_substitution.id > 0 && !patrol.pending_substitution.sub_id, 'warning': patrol.pending_substitution.sub_id > 0}">
              <td>
                <a routerLink="../DutyDay/{{patrol.duty_day.id}}">{{patrol.duty_day.date}}</a>
              </td>
              <td>{{patrol.duty_day.team.name}}</td>
              <td>{{patrol.responsibility.name}} v{{patrol.responsibility.version}}</td>
              <td>
                <button class="btn btn-primary" *ngIf="!patrol.pending_substitution.id" [disabled]="!patrol.swappable" (click)="createClick(i, patrol.id, patrol.duty_day.date)">Request Sub</button>
                <button class="btn btn-primary" *ngIf="patrol.pending_substitution.id" [disabled]="!patrol.swappable" (click)="manageClick(i, patrol.id,  patrol.duty_day.date, patrol.pending_substitution.id, patrol.pending_substitution.sub_id, patrol.pending_substitution.sub_name)">Manage Sub</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PatrolsTab {
  @Input() public patrols: Array<any>;
  @Output() public createSub = new EventEmitter();
  @Output() public manageSub = new EventEmitter();

  createClick(index: number, patrolId: number, date: string) {
    this.createSub.emit({
      index: index,
      patrolId: patrolId,
      date: date
    });
  }

  manageClick(index: number, patrolId: number, date: string, subId: number, subUserId: number, subName: string) {
    this.manageSub.emit({
      index: index,
      patrolId: patrolId,
      date: date,
      subId: subId,
      subUserId: subUserId,
      subName: subName
    });
  }
}
