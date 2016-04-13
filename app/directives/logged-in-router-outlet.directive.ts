import { ElementRef, DynamicComponentLoader, AttributeMetadata, Directive, Attribute } from 'angular2/core';
import { Router, RouterOutlet, ComponentInstruction } from 'angular2/router';
import {IAuthService} from '../services/iauth.service';

@Directive({
    selector: 'router-outlet'
})

export class LoggedInRouterOutlet extends RouterOutlet {
    private router: Router;

    constructor(
        _elementRef: ElementRef, _loader: DynamicComponentLoader,
        _parentRouter: Router, @Attribute('name') nameAttr: string,
        private _authService: IAuthService
    ) {
        super(_elementRef, _loader, _parentRouter, nameAttr);

        this.router = _parentRouter;
    }

    activate(instruction: ComponentInstruction) {
        var roles = <string[]> instruction.routeData.data['roles'];

        // no defined roles means it is a public route	
	if (roles == null) {
	    return super.activate(instruction);
	}

	// if the user isn't autheticated
	if (this._authService.isLoggedIn()) {
	    if (roles.length == 0 || this._authService.hasRole(roles)) {
                return super.activate(instruction);
	    } else {
                this.router.navigate(['Dash']); //navigate to default route
            }
        }	    

        this.router.navigate(['Login']);
    }

}
