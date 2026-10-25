import {
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import { resolveFieldErrorMessage } from '@shared/utils/form-error.util';

export type TextInputType = 'text' | 'email' | 'tel' | 'password' | 'url';

@Component({
  imports: [FormFieldComponent],
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
})
export class TextInputComponent implements FormValueControl<string> {
  // Explicit configuration inputs
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<TextInputType>('text');
  readonly autocomplete = input<string>('off');
  readonly placeholder = input<string>('');
  readonly helperText = input<string | null>(null);
  readonly errorMessages = input<Partial<Record<string, string>>>();

  // FormValueControl<string> contract (automatically bound by [formField])
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly touched = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly name = input<string>('');
  readonly touch = output<void>();

  private readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly isInvalid = computed(() => this.touched() && this.invalid());

  protected readonly resolvedError = computed(() => {
    if (!this.isInvalid()) {
      return null;
    }

    return resolveFieldErrorMessage(
      this.errors(),
      this.label(),
      this.errorMessages(),
    );
  });

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.helperText()) {
      ids.push(`${this.id()}-helper`);
    }

    if (this.isInvalid()) {
      ids.push(`${this.id()}-error`);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  focus(options?: FocusOptions): void {
    this.inputElement().nativeElement.focus(options);
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }

  protected onBlur(): void {
    this.touch.emit();
  }
}
