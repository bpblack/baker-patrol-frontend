import { Pipe, PipeTransform } from '@angular/core';
import { CprStudent } from '../../shared/services/baker-api.service';

@Pipe({name: 'searchStudents'})
export class SearchStudentsPipe implements PipeTransform {
  transform(roster: CprStudent[], search: string): any {
    if (!search || search.length === 0 ) {
      return roster;
    } else {
      let sl = search.toLowerCase();
      let students = roster.filter(
        (student: CprStudent) => {
          //search shouldn't be blank, and skip the team portion of team name since it's always team
          if (student.name.toLowerCase().indexOf(sl) > -1 
              || (student.email && student.email.toLowerCase().indexOf(sl) > -1)) {
              return true;
          }
          return false;
        }
      );
      return students;
    }
  }
}