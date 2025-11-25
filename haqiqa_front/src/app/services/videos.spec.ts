import { TestBed } from '@angular/core/testing';

import { Videos } from './videos';

describe('Videos', () => {
  let service: Videos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Videos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
