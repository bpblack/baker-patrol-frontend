import { ElementRef, DynamicComponentLoader, AttributeMetadata, Directive, Attribute } from 'angular2/core';
import { Router, RouterOutlet, ComponentInstruction } from 'angular2/router';
import {BakerApiService} from '../services/baker-api.service';

@Directive({
  selector: 'router-outlet'
})

export class LoggedInRouterOutlet extends RouterOutlet {
  publicRoutes: Array<string>;
  private router: Router;
  private apiService: BakerApiService;

  constructor(
    _elementRef: ElementRef, _loader: DynamicComponentLoader,
    _parentRouter: Router, @Attribute('name') nameAttr: string,
    private _apiService: BakerApiService
  ) {
    super(_elementRef, _loader, _parentRouter, nameAttr);

    this.router = _parentRouter;
    this.publicRoutes = [
      'Login', 'Forgot', 'Reset'
    ];
  }

  activate(instruction: ComponentInstruction) {
    if (this._canActivate(instruction.urlPath.split("/")[0])) {
      return super.activate(instruction);
    }

    this.router.navigate(['Login']);
  }

  _canActivate(url) {
    return this.publicRoutes.indexOf(url) !== -1
      || this._apiService.isLoggedIn();
  }
}
