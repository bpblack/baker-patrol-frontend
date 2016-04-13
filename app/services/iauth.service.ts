export abstract class IAuthService {
    abstract isLoggedIn(): boolean;
    abstract hasRole(roles: string[]): boolean;
}
