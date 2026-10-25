import { Component, computed, input } from '@angular/core';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  imports: [SpinnerComponent],
  selector: 'app-button',
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly type = input<ButtonType>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
}
