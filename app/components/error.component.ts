import {Component, Input} from '@angular/core';

@Component({
  selector: 'baker-api-error',
  template: `
     <div [hidden]="!hasError()" class="alert alert-danger">
        <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
        <span class="sr-only">Error:</span>
        {{error}}
      </div>
  `
})

export class BakerApiError {
  @Input() public cond: boolean;
  @Input() public error: string;
  
  hasError() : boolean {
    if (this.cond != null) {
      return this.cond;
    }
    return (this.error && 0 != this.error.length);
  }
}
