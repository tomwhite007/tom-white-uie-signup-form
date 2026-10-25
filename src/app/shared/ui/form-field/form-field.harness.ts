import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';

export interface FormFieldHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class FormFieldHarness extends ComponentHarness {
  static hostSelector = 'app-form-field';

  static with(options: FormFieldHarnessFilters = {}): HarnessPredicate<FormFieldHarness> {
    return new HarnessPredicate(FormFieldHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label),
    );
  }

  private readonly labelSpan = this.locatorFor('label > span:first-child');
  private readonly requiredIndicator = this.locatorForOptional('label > span[aria-hidden="true"]');
  private readonly helperElement = this.locatorForOptional('p[id$="-helper"]');
  private readonly errorElement = this.locatorForOptional('[role="alert"]');
  private readonly controlElement = this.locatorForOptional('input, select, textarea');

  async getLabelText(): Promise<string> {
    const label = await this.labelSpan();
    return (await label.text()).trim();
  }

  async isRequired(): Promise<boolean> {
    const indicator = await this.requiredIndicator();
    return indicator !== null;
  }

  async getHelperText(): Promise<string | null> {
    const helper = await this.helperElement();
    return helper ? (await helper.text()).trim() : null;
  }

  async getErrorText(): Promise<string | null> {
    const error = await this.errorElement();
    return error ? (await error.text()).trim() : null;
  }

  async hasError(): Promise<boolean> {
    const error = await this.errorElement();
    return error !== null;
  }

  async getControl(): Promise<TestElement | null> {
    return this.controlElement();
  }
}
