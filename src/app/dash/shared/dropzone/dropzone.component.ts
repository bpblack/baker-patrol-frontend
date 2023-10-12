import { Component, Input } from "@angular/core";
import { DropzoneComponent } from "@ngx-dropzone/cdk";

@Component({
  selector: "baker-dropzone",
  template: `
    <div class="border border-secondary-subtle rounded bg-body-secondary pe-auto baker-dropzone" (click)="onContainerClick()">
      <span class="border border-secondary-subtle rounded choose-file-button">Choose file</span>
      <span class="file-message">{{message}}</span>
      <ng-content select="[fileInput]"></ng-content>
    </div>
  `,
  styleUrls: ['./dropzone.component.css']
})
export class BakerDropzone extends DropzoneComponent {
  @Input() 
  set message(m: string) { this._message = m; }
  get message(): string { return this._message; }
  private _message = 'Drop file here';

  onContainerClick(): void {
    this.openFilePicker();
  }

}