export interface KeyboardCallbacks {
  onPauseToggle(): void;
  onGuardrailsToggle(): void;
  onDarkModeToggle(): void;
  onMuteToggle(): void;
  onLogToggle(): void;
  onControlsToggle(): void;
  onHelpToggle(): void;
  onEscape(): void;
  onReset(): void;
}

export function initKeyboard(callbacks: KeyboardCallbacks): void {
  window.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input/select
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    const key = e.key.toLowerCase();

    switch (key) {
      case ' ':
        e.preventDefault();
        callbacks.onPauseToggle();
        break;
      case 'g':
        callbacks.onGuardrailsToggle();
        break;
      case 'd':
        callbacks.onDarkModeToggle();
        break;
      case 'm':
        callbacks.onMuteToggle();
        break;
      case 'l':
        callbacks.onLogToggle();
        break;
      case 'c':
        callbacks.onControlsToggle();
        break;
      case '?':
        callbacks.onHelpToggle();
        break;
      case 'r':
        callbacks.onReset();
        break;
      case 'escape':
        callbacks.onEscape();
        break;
    }
  });
}
