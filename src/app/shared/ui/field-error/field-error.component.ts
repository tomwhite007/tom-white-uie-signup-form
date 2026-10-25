import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
})
export class FieldErrorComponent {
  readonly message = input.required<string>();
}

