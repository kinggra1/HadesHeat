import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PactListComponent } from './pact-list.component';

describe('PactListComponent', () => {
  let component: PactListComponent;
  let fixture: ComponentFixture<PactListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PactListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
