import { Component, input, output } from '@angular/core';
import { SignUpPayload } from '@core/api/sign-up.models';
import { ButtonComponent } from '@shared/ui/button/button.component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-sign-up-success',
  templateUrl: './sign-up-success.component.html',
})
export class SignUpSuccessComponent {
  readonly message = input<string | null>(null);
  readonly submittedData = input<SignUpPayload | null>(null);

  readonly resetClicked = output<void>();

  protected onReset(): void {
    this.resetClicked.emit();
  }
}
