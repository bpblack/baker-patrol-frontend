import { Pipe, PipeTransform } from '@angular/core';
import { TeamRoster, RosterUser } from '../../shared/services/baker-api.service';

@Pipe({name: 'searchRoster'})
export class SearchRosterPipe implements PipeTransform {
  transform(roster: TeamRoster[], search: string): any {
    if (!search || search.length === 0 ) {
      return roster;
    } else {
      let newRoster: TeamRoster[] = [];
      let sl = search.toLowerCase();
      for (let team of roster) {
        let members = team.members.filter(
          (member: RosterUser) => {
            //search shouldn't be blank, and skip the team portion of team name since it's always team
            if (member.name.toLowerCase().indexOf(sl) > -1 
                || (member.email && member.email.toLowerCase().indexOf(sl) > -1) 
                || (member.phone && member.phone.indexOf(sl) > -1)
                || (member.roles && member.roles.toLowerCase().indexOf(sl) > -1)) {
              console.log("Found", member);
              return true;
            }
            return false;
          }
        );
        newRoster.push({name: team.name, members: members, collapsed: members.length === 0});
      }
      return newRoster;
    }
  }
}