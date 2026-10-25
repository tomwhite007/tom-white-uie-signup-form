import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { TextInputComponent } from './text-input.component';
import { TextInputHarness } from './text-input.harness';

interface TestFormModel {
  readonly firstName: string;
}

@Component({
  imports: [FormField, TextInputComponent],
  template: `
    <app-text-input
      id="first-name"
      label="First name"
      placeholder="e.g. Jane"
      helperText="Enter your given name."
      [formField]="testForm.firstName"
    />
  `,
})
class TestHostComponent {
  readonly model = signal<TestFormModel>({ firstName: '' });
  readonly testForm = form(this.model, (path) => {
    required(path.firstName, { message: 'First name is required.' });
  });
}

describe('TextInputComponent (with TextInputHarness & Signal Forms)', () => {
  it('binds to Signal Forms via [formField], updates value, and surfaces validation errors on blur', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const input = await loader.getHarness(
      TextInputHarness.with({ label: 'First name' }),
    );

    expect(await input.getLabelText()).toBe('First name');
    expect(await input.isRequired()).toBe(true);
    expect(await input.getHelperText()).toBe('Enter your given name.');
    expect(await input.hasError()).toBe(false);

    // Blur while empty to mark touched and surface required validation error
    await input.focus();
    await input.blur();

    expect(await input.hasError()).toBe(true);
    expect(await input.getErrorText()).toBe('First name is required.');

    // Type a valid value and verify the Signal Forms model updates and error clears
    await input.setValue('Jane');
    expect(await input.getValue()).toBe('Jane');
    expect(fixture.componentInstance.model().firstName).toBe('Jane');
    expect(await input.hasError()).toBe(false);
  });

  it('delegates focusBoundControl() from Signal Forms to the native input element', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const input = await loader.getHarness(TextInputHarness);

    expect(await input.isFocused()).toBe(false);

    fixture.componentInstance.testForm.firstName().focusBoundControl();
    expect(await input.isFocused()).toBe(true);
  });
});
