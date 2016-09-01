export class LoginForm {
    constructor(public email: string, public password: string) {}
}

export class ResetForm {
    constructor(public password: string, public confirm_password: string) {}
}

export class CreateSubEmailForm {
  constructor(public reason: string, public message: string) {}
}

export class CreateSubAssignForm {
  constructor(public reason: string, public assigned_id: number) {}
}


export class AssignSubForm {
  constructor(public assigned_id: number) {}
}

export class RejectSubForm {
  constructor(public message: string) {}
}
