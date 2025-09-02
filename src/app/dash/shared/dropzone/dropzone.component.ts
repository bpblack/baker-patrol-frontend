import { Component, Input } from "@angular/core";
import { IconDefinition, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { DropzoneComponent} from "@ngx-dropzone/cdk";

@Component({
    selector: "baker-dropzone",
    template: `
    <div class="border border-secondary-subtle rounded bg-body-secondary pe-auto baker-dropzone" (click)="onContainerClick()">
      <span class="border border-secondary-subtle rounded choose-file-button">Choose file</span>
      <span class="file-message">{{message}}</span>
      <ng-content select="[fileInput]"></ng-content>
    </div>
    @if(error) {
      <div class="invalid-file">
        <fa-icon [icon]="triangle"></fa-icon>&nbsp;
        {{error}}
      </div>
    }
  `,
    styleUrls: ['./dropzone.component.css'],
    standalone: false
})
export class BakerDropzone extends DropzoneComponent {
  @Input() 
  set message(m: string) { this._message = m; }
  get message(): string { return this._message; }
  private _message: string = 'Drop file here';

  @Input() 
  set error(e: string) { this._error = e; }
  get error(): string { return this._error; }
  private _error: string = '';

  get triangle(): IconDefinition { return faTriangleExclamation; }

  onContainerClick(): void {
    this.openFilePicker();
  }

}