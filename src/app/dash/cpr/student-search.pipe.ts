import { Pipe, PipeTransform } from '@angular/core';
import { CprStudent } from '../../shared/services/baker-api.service';

@Pipe({name: 'searchStudents'})
export class SearchStudentsPipe implements PipeTransform {
  transform(roster: CprStudent[], search: string, cm: Map<number, string>, fn: (i: number | null, m: Map<number, string>) => string): any {
    if (!search || search.length === 0 ) {
      return roster;
    } else {
      let sl = search.toLowerCase();
      let students = roster.filter(
        (student: CprStudent) => {
          //search shouldn't be blank, and skip the team portion of team name since it's always team
          const sn: string = student.first_name + ' ' + student.last_name;
          if (sn.toLowerCase().indexOf(sl) > -1 
              || student.email && student.email.toLowerCase().indexOf(sl) > -1
              || fn(student.cpr_class_id, cm).toLowerCase().indexOf(sl) > -1) {
              return true;
          }
          return false;
        }
      );
      return students;
    }
  }
}