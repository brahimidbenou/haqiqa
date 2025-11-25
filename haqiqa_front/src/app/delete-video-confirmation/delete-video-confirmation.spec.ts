import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteVideoConfirmation } from './delete-video-confirmation';

describe('DeleteVideoConfirmation', () => {
  let component: DeleteVideoConfirmation;
  let fixture: ComponentFixture<DeleteVideoConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteVideoConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteVideoConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
