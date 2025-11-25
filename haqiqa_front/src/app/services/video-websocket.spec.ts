import { TestBed } from '@angular/core/testing';

import { VideoWebsocket } from './video-websocket';

describe('VideoWebsocket', () => {
  let service: VideoWebsocket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoWebsocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
