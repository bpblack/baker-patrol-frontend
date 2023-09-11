import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Substitution } from 'src/app/shared/services/baker-api.service';

@Component({
  selector: 'baker-requests-tab',
  templateUrl: './requests-tab.component.html'
})
export class RequestsTabComponent {
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  
  @Input() requests: Substitution[];
  @Output() manageRequest = new EventEmitter<number>();

  manageClick(index: number) {
    this.manageRequest.emit(index);
  }
}
