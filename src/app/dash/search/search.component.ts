import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'baker-search',
  templateUrl: './search.component.html' 
})
export class SearchComponent {
  @Input() term!: string;
  @Output() termChange = new EventEmitter<string>();
}