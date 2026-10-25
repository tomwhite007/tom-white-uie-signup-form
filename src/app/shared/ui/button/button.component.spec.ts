import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ButtonHarness } from './button.harness';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button
      [type]="'button'"
      [loading]="loading()"
      [disabled]="disabled()"
      (click)="onClick()"
    >
      {{ label() }}
    </app-button>
  `,
})
class TestHostComponent {
  readonly label = signal('Submit form');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  clickCount = 0;

  onClick(): void {
    this.clickCount += 1;
  }
}

describe('ButtonComponent (with ButtonHarness)', () => {
  it('renders button text and handles click events when enabled', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness(ButtonHarness.with({ text: 'Submit form' }));

    expect(await button.getText()).toBe('Submit form');
    expect(await button.isDisabled()).toBe(false);
    expect(await button.isLoading()).toBe(false);

    await button.click();
    expect(fixture.componentInstance.clickCount).toBe(1);
  });

  it('disables the button and renders the loading spinner when loading is true', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.loading.set(true);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness(ButtonHarness);

    expect(await button.isLoading()).toBe(true);
    expect(await button.isDisabled()).toBe(true);
  });

  it('disables the button when disabled is true', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.disabled.set(true);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness(ButtonHarness);

    expect(await button.isDisabled()).toBe(true);
    expect(await button.isLoading()).toBe(false);
  });
});
