import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IconDefinition, faCheck, faCheckCircle, faGear } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { BakerApiService, CprClass, CprStudent } from 'src/app/shared/services/baker-api.service';
import { styleControl } from 'src/app/shared/validations/validations';

function classSizeValidator(val: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const cmp: number = +c.value;
    return (cmp && cmp < val) ? { sizeTooSmall: true } : null; 
  }
}

@Component({
  selector: 'baker-cpr-class',
  templateUrl: './cprclasses.component.html'
})
export class CprClassesComponent {
  public selected: number = 0;
  public cprClasses: CprClass[];
  public error: string | null = null;
  public resize: FormGroup;
  public resized: boolean = false;
  public igear: IconDefinition = faGear;
  public icheck: IconDefinition = faCheck;
  
  constructor(private _api: BakerApiService, private _fb: FormBuilder) {}

  ngOnInit() {
    this._api.getCprClasses(true).pipe(
      finalize(() => {
        const cur = this.cprClasses[this.selected];
        this.resize = this._fb.group({
          size: new FormControl(cur.class_size, [Validators.required, Validators.pattern("^[0-9]+$"), classSizeValidator(cur.students_count!)])
        });
      })
    ).subscribe({
      next: (c: CprClass[]) => this.cprClasses = c,
      error: (e: Error) => this.error = e.message
    })
  }

  getClassTitle(i: number) {
    const c = this.cprClasses[i];
    return `${c.time} @ ${c.location} (Enrollment: ${c.students_count}/${c.class_size})`
  }

  selectClass(value: any) {
    this.selected = value.target.value;
    const cur = this.cprClasses[this.selected];
    this.resize.controls['size'].setValue(cur.class_size);
    this.resize.controls['size'].clearValidators();
    this.resize.controls['size'].setValidators([Validators.required, Validators.pattern("^[0-9]+$"), classSizeValidator(cur.students_count!)]);
    this.resize.controls['size'].markAsPristine();
  }

  classMailLink() {
    return 'mailto:?bcc=' + this.cprClasses[this.selected].students!.map((s: CprStudent) => s.email).join(',');
  }

  onResize() {
    this._api.log("Resize to", +this.resize.controls['size'].value);
    this.resized = true;
    const vals = this.resize.value;
    let cur = this.cprClasses[this.selected];
    this._api.resizeCprClass(cur.id, this.resize.value).pipe(
      finalize(() => {
        this.resized = false;
        this.resize.controls['size'].markAsPristine();
      })
    ).subscribe({
      next: (b: boolean) => cur.class_size = +vals.size,
      error: (e: Error) => this.error = e.message
    });
  }

  styleResize() {
    return styleControl(this.resize.controls['size']);
  }
}
