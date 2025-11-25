import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreOptions } from './more-options';

describe('MoreOptions', () => {
  let component: MoreOptions;
  let fixture: ComponentFixture<MoreOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
