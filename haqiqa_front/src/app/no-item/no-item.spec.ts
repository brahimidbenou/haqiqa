import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoItem } from './no-item';

describe('NoItem', () => {
  let component: NoItem;
  let fixture: ComponentFixture<NoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
