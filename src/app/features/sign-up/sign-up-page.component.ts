import { Component, inject } from '@angular/core';
import { SignUpFormComponent } from './components/sign-up-form/sign-up-form.component';
import { SignUpSuccessComponent } from './components/sign-up-success/sign-up-success.component';
import { SignUpStore } from './store/sign-up.store';

@Component({
  imports: [SignUpFormComponent, SignUpSuccessComponent],
  providers: [SignUpStore],
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
})
export class SignUpPageComponent {
  protected readonly store = inject(SignUpStore);
}
