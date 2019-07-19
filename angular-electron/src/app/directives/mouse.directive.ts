import {
  Directive,
  Output,
  HostListener,
  EventEmitter,
  KeyValueDiffers
} from '@angular/core';

@Directive({ selector: '[mouse]' })
export class MouseDirective {
  @Output() mouseWheelUp = new EventEmitter();
  @Output() mouseWheelDown = new EventEmitter();
  @Output() mouseDownClick = new EventEmitter();
  @Output() mouseUpClick = new EventEmitter();
  @Output() mouseMove = new EventEmitter();
  @Output() keyUp = new EventEmitter();

  @HostListener('mousewheel', ['$event']) onmousewheel(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('window:keyup', ['$event'])
  KeyboardEvent(event: KeyboardEvent) {
    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      this.keyFunc(event);
    }
  }

  mouseWheelFunc(event: any) {
    event = window.event;
    const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
    if (delta > 0) {
      this.mouseWheelUp.emit(event);
    } else if (delta < 0) {
      this.mouseWheelDown.emit(event);
    }
  }

  keyFunc(event: any) {
    event = window.event;
    this.keyUp.emit(event);
  }
}
