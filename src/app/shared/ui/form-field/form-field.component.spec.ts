import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';
import { FormFieldHarness } from './form-field.harness';

@Component({
  imports: [FormFieldComponent],
  template: `
    <app-form-field
      id="test-email"
      [label]="label()"
      [required]="required()"
      [helperText]="helperText()"
      [errorMessage]="errorMessage()"
    >
      <input id="test-email" type="email" />
    </app-form-field>
  `,
})
class TestHostComponent {
  readonly label = signal('Email address');
  readonly required = signal(true);
  readonly helperText = signal<string | null>('Enter your work email.');
  readonly errorMessage = signal<string | null>(null);
}

describe('FormFieldComponent (with FormFieldHarness)', () => {
  it('renders label, required indicator, helper text, and projected control', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const field = await loader.getHarness(
      FormFieldHarness.with({ label: 'Email address' }),
    );

    expect(await field.getLabelText()).toBe('Email address');
    expect(await field.isRequired()).toBe(true);
    expect(await field.getHelperText()).toBe('Enter your work email.');
    expect(await field.hasError()).toBe(false);
    expect(await field.getErrorText()).toBeNull();
    expect(await field.getControl()).not.toBeNull();
  });

  it('displays an alert error message when errorMessage is provided', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.errorMessage.set('Email address is required.');
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const field = await loader.getHarness(FormFieldHarness);

    expect(await field.hasError()).toBe(true);
    expect(await field.getErrorText()).toBe('Email address is required.');
  });
});
