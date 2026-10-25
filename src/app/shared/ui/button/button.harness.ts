import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';

export interface ButtonHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export class ButtonHarness extends ComponentHarness {
  static hostSelector = 'app-button';

  static with(options: ButtonHarnessFilters = {}): HarnessPredicate<ButtonHarness> {
    return new HarnessPredicate(ButtonHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  private readonly buttonElement = this.locatorFor('button');
  private readonly spinnerElement = this.locatorForOptional('app-spinner');

  async getText(): Promise<string> {
    const button = await this.buttonElement();
    return (await button.text()).trim();
  }

  async isDisabled(): Promise<boolean> {
    const button = await this.buttonElement();
    return button.getProperty<boolean>('disabled');
  }

  async isLoading(): Promise<boolean> {
    const button = await this.buttonElement();
    const ariaBusy = await button.getAttribute('aria-busy');
    const spinner = await this.spinnerElement();
    return ariaBusy === 'true' && spinner !== null;
  }

  async click(): Promise<void> {
    const button = await this.buttonElement();
    await button.click();
  }
}
