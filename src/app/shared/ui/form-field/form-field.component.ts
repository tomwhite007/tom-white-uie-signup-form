import { Component, computed, input } from '@angular/core';
import { FieldErrorComponent } from '@shared/ui/field-error/field-error.component';

@Component({
  imports: [FieldErrorComponent],
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly required = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);
  readonly helperText = input<string | null>(null);

  protected readonly helperId = computed(() => `${this.id()}-helper`);
  protected readonly errorId = computed(() => `${this.id()}-error`);
}
