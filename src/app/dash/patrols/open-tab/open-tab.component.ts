import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition, faGear, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Subscription, switchMap, timer } from 'rxjs';
import { BakerApiService, OpenRequest, Season } from 'src/app/shared/services/baker-api.service';

@Component({
    selector: 'baker-open-tab',
    templateUrl: './open-tab.component.html',
    standalone: false
})
export class OpenTabComponent {
  public error: string | null = null;
  public openRequests: OpenRequest[];
  public igear: IconDefinition = faGear;
  public itriangle: IconDefinition = faTriangleExclamation;
  @Input() public seasonId: number;
  @Output() public count = new EventEmitter<number>;

  private _poll: Subscription;
  
  constructor(private _api: BakerApiService) { }

  ngOnInit() {
    this._poll = timer(0, 60000).pipe(
      switchMap(() => this._api.getOpenSubRequests(this.seasonId))
    ).subscribe((o: OpenRequest[]) => {
      this.openRequests = o;
      this.count.emit(this.openRequests.length);
    });
  }

  ngOnDestroy() {
    this._poll.unsubscribe();
  }

  contactClick(i: number) {
    return 'mailto:' + this.openRequests[i].email;
  }
}
