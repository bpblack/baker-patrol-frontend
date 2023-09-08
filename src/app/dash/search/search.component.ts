import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'baker-search',
  templateUrl: './search.component.html' 
})
export class SearchComponent implements OnInit {
  @Output() update = new EventEmitter();

  ngOnInit() {
    this.update.emit('');
  }
}