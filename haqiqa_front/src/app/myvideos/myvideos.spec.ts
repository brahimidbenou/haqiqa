import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Myvideos } from './myvideos';

describe('Home', () => {
  let component: Myvideos;
  let fixture: ComponentFixture<Myvideos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Myvideos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Myvideos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
