import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { IconDefinition, faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BakerApiService } from 'src/app/shared/services/baker-api.service';
import { idSelectionValidator } from 'src/app/shared/validations/validations';
import { PatrolResponsibility } from '../duty-day.component';

export interface SwapResult {
  from: number;
  to: number;
}

@Component({
  selector: 'baker-responsibility-swap-form',
  templateUrl: './responsibility-swap-form.component.html'
})
export class ResponsibilitySwapFormComponent implements OnInit {
  public submitted: boolean = false;
  public closed: boolean = false;
  public swapForm: FormGroup;
  public igear: IconDefinition = faGear;
  public icheck: IconDefinition = faCheck;
  public ixmark: IconDefinition = faXmark;

  @Input() public patrolId: number = 0;
  @Input() public responsibilities: PatrolResponsibility[];
  @Output() public swap = new EventEmitter<SwapResult>();

  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.swapForm = this._fb.group({
      with: new FormControl(this.patrolId, idSelectionValidator())
    });
  }

  onSwapSubmit() {
    this.submitted = true;
    this._api.swapResponsibilities(this.patrolId, this.swapForm.value).pipe(
      finalize(() => this.submitted = false)
    ).subscribe({
      next: () => this.swap.emit({from: this.patrolId, to: +this.swapForm.controls['with'].value})
    });
  }

  onClose() {
    this.closed = true;
    this.swap.emit({from: -1, to: -1});
  }
}

