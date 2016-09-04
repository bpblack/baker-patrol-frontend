import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'baker-requests-tab',
  template: `
    <div class="panel-body">
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patroller</th>
              <th>Responsibility</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let request of requests; let i = index">
              <td>
                <a routerLink="../DutyDay/{{request.duty_day.id}}">{{request.duty_day.date}}</a>
              </td>
              <td>{{request.sub_for.name}}</td>
              <td>{{request.responsibility.name}} v{{request.responsibility.version}}</td>
              <td>
                <button class="btn btn-primary" (click)="manageClick(i, request.id, request.duty_day.date, request.sub_for.name)">Accept/Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RequestsTab {
  @Input() public requests: Array<any>;
  @Output() public manageRequest = new EventEmitter();

  manageClick(index: number, requestId: number, date: string, subName: string) {
    this.manageRequest.emit({
      index: index,
      requestId: requestId,
      date: date,
      subName: subName
    });
  }
}
