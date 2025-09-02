import { Pipe, PipeTransform } from '@angular/core';
import { DutyDay } from '../../../shared/services/baker-api.service';

@Pipe({
    name: 'searchDutyDays',
    standalone: false
})
export class SearchDutyDaysPipe implements PipeTransform {
  transform(dutyDays: DutyDay[], search: string): any {
    if (!search || search.length === 0) {
      return dutyDays;
    } else {
      let sl = search.toLowerCase();
      return dutyDays.filter(
        (dd: DutyDay) => {
          let teamName = (dd.team) ? dd.team.name.toLowerCase().split(' ')[0] + ' ' : '';
          //search shouldn't be blank, and skip the team portion of team name since it's always team
          if (dd.date.toLocaleString().indexOf(sl) > -1 || teamName.indexOf(sl) > -1) {
            return true;
          }
          return false;
        }
      );
    }
  }
}