import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { PatrolDetails } from 'src/app/shared/services/baker-api.service';

@Component({
    selector: 'baker-patrols-tab',
    templateUrl: './patrols-tab.component.html',
    standalone: false
})
export class PatrolsTabComponent {
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  @Input() patrols: PatrolDetails[];
  @Output() createSub = new EventEmitter();
  @Output() manageSub = new EventEmitter();

  createClick(index: number) {
    this.createSub.emit(index);
  }

  manageClick(index: number) {
    this.manageSub.emit(index);
  }

  rowColor(latestSub: any) : string {
    if (latestSub) {
      return latestSub.sub_id ? 'table-warning' : 'table-danger';
    }
    return '';
  }
}
