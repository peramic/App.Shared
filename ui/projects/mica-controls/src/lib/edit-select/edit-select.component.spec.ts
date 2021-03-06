import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSelectComponent } from './edit-select.component';

describe('EditableComponent', () => {
  let component: EditSelectComponent;
  let fixture: ComponentFixture<EditSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
