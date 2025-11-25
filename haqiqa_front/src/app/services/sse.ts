import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { fetchEventSource, EventStreamContentType, FetchEventSourceInit } from '@microsoft/fetch-event-source';

@Injectable({
  providedIn: 'root'
})
export class Sse {
  private apiUrl = "http://localhost:8080/messages";

  constructor(
    private zone: NgZone,
    private authService: Auth
  ) { }

  getSSE(videoId: string, query: string): Observable<string> {
    return new Observable<string>(observer => {

      const url = new URL(`${this.apiUrl}/chat/${videoId}/stream`);
      url.searchParams.append('query', query);

      const token = this.authService.getToken();
      console.log('Token being sent:', token);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': EventStreamContentType
      };

      const controller = new AbortController();

      const fetchOptions: FetchEventSourceInit = {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
        
        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
            console.log('SSE Connection Established');
            return;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            const errorText = await response.text();
            const err = new Error(`Client Error: ${response.status} - ${errorText}`);
            throw err;
          } else {
            const errorText = await response.text();
            const err = new Error(`Server Error: ${response.status} - ${errorText}. Retrying...`);
            console.warn(err.message);
            throw err;
          }
        },

        onmessage: (msg) => {
          if (msg.event === 'Error') {
            this.zone.run(() => observer.error(new Error(msg.data)));
            return;
          }

          if (msg.data) {
            this.zone.run(() => {
              observer.next(msg.data);
            });
          }
        },

        onclose: () => {
          console.log('SSE Connection Closed');
          this.zone.run(() => {
            observer.complete();
          });
        },

        onerror: (err) => {
          console.error('SSE Error:', err);
          if (err.name === 'AbortError') {
            console.log('SSE intentionally aborted.');
            return; 
          }

          this.zone.run(() => {
            observer.error(err);
          });

          throw err;
        }
      };

      fetchEventSource(url.toString(), {
        ...fetchOptions,
        onopen: (response) => fetchOptions.onopen!.call(this, response),
        onmessage: (msg) => fetchOptions.onmessage!.call(this, msg),
        onclose: () => fetchOptions.onclose!.call(this),
        onerror: (err) => fetchOptions.onerror!.call(this, err),
      }).catch((err) => {
          if (err.name !== 'AbortError') {
            this.zone.run(() => observer.error(err));
          }
      });


      return () => {
        console.log('Aborting SSE connection...');
        controller.abort(); 
      };
    });
  }
}