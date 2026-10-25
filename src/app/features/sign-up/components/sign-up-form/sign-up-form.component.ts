import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { TextInputComponent } from '@shared/ui/text-input/text-input.component';
import {
  FieldConfig,
  SignUpFieldKey,
  SignUpFormModel,
} from '../../store/sign-up.schema';

@Component({
  imports: [FormField, TextInputComponent, ButtonComponent],
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
})
export class SignUpFormComponent {
  readonly signUpForm = input.required<FieldTree<SignUpFormModel>>();
  readonly fields = input.required<readonly FieldConfig[]>();
  readonly isSubmitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly submitted = output<void>();

  protected getField(key: SignUpFieldKey): FieldTree<string, string> {
    return this.signUpForm()[key];
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }
}
