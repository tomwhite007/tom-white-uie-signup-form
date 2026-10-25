import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';
import { FormFieldHarness } from '@shared/ui/form-field/form-field.harness';

export interface TextInputHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class TextInputHarness extends ComponentHarness {
  static hostSelector = 'app-text-input';

  static with(options: TextInputHarnessFilters = {}): HarnessPredicate<TextInputHarness> {
    return new HarnessPredicate(TextInputHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label),
    );
  }

  private readonly formField = this.locatorFor(FormFieldHarness);
  private readonly inputElement = this.locatorFor('input');

  async getLabelText(): Promise<string> {
    const field = await this.formField();
    return field.getLabelText();
  }

  async isRequired(): Promise<boolean> {
    const field = await this.formField();
    return field.isRequired();
  }

  async getHelperText(): Promise<string | null> {
    const field = await this.formField();
    return field.getHelperText();
  }

  async getErrorText(): Promise<string | null> {
    const field = await this.formField();
    return field.getErrorText();
  }

  async hasError(): Promise<boolean> {
    const field = await this.formField();
    return field.hasError();
  }

  async getValue(): Promise<string> {
    const input = await this.inputElement();
    return input.getProperty<string>('value');
  }

  async setValue(newValue: string): Promise<void> {
    const input = await this.inputElement();
    await input.clear();
    if (newValue) {
      await input.sendKeys(newValue);
    }
    await input.dispatchEvent('input');
  }

  async focus(): Promise<void> {
    const input = await this.inputElement();
    await input.focus();
  }

  async blur(): Promise<void> {
    const input = await this.inputElement();
    await input.blur();
  }

  async isFocused(): Promise<boolean> {
    const input = await this.inputElement();
    return input.isFocused();
  }

  async isDisabled(): Promise<boolean> {
    const input = await this.inputElement();
    return input.getProperty<boolean>('disabled');
  }
}
