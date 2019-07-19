import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureWorkplaceComponent } from './picture-workplace.component';

describe('PictureWorkplaceComponent', () => {
  let component: PictureWorkplaceComponent;
  let fixture: ComponentFixture<PictureWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
