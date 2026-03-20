export interface KeyboardCallbacks {
  onPauseToggle(): void;
  onGuardrailsToggle(): void;
  onDarkModeToggle(): void;
  onMuteToggle(): void;
  onLogToggle(): void;
  onHelpToggle(): void;
  onReset(): void;
}

export function initKeyboard(callbacks: KeyboardCallbacks): void {
  window.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input/select
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        callbacks.onPauseToggle();
        break;
      case 'KeyG':
        callbacks.onGuardrailsToggle();
        break;
      case 'KeyD':
        callbacks.onDarkModeToggle();
        break;
      case 'KeyM':
        callbacks.onMuteToggle();
        break;
      case 'KeyL':
        callbacks.onLogToggle();
        break;
      case 'Slash':
        if (e.shiftKey) { // '?' is Shift + '/'
          callbacks.onHelpToggle();
        }
        break;
      case 'KeyR':
        callbacks.onReset();
        break;
      case 'Escape':
        // Only trigger help toggle if modal is open (handled by specific UI logic usually, but here we can just call it)
        // For simplicity, we just trigger the callback
        // callbacks.onHelpToggle();
        break;
    }
  });
}
