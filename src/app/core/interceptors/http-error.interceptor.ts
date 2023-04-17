import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    // private authService: AuthService,
    // private storageService: StorageService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // const excludePages = this.excludeUrl(request);
    // request = excludePages ? request : this.addAuthenticationToken(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
      //   if (error?.status === 403 && !request?.url?.includes('/refreshtoken')) {
      //     return this.authService.refreshToken().pipe(
      //       switchMap(
      //         () => next.handle(this.addAuthenticationToken(request)) // TODO next.handle(request)
      //       ),
      //       catchError(() => {
      //         this.authService.logout();
      //         this.router.navigate(['/login']);
      //         return EMPTY;
      //       })
      //     );
      //   }

      //   if ([401, 403]?.includes(error.status)) {
      //     this.authService.logout();
      //     this.router.navigate(['/login']);
      //     return throwError(() => error?.error); // EMPTY;
      //   }

        return throwError(() => new Error(error?.toString()) ); //error?.error
      })
    );
  }

  // private addAuthenticationToken(
  //   request: HttpRequest<unknown>
  // ): HttpRequest<unknown> {
  //   const accessToken = this.storageService.getToken(LOCALSTORAGE_TYPES.TOKEN);
  //   if (!accessToken || this.excludeUrl(request)) {
  //     return request;
  //   }

  //   return request.clone({
  //     headers: request.headers.set('Authorization', `${accessToken}`)
  //   });
  // }

  // private excludeUrl(request: HttpRequest<unknown>): boolean {
  //   return request.url.includes('/token'); //|| request.url.includes('/refreshtoken'); // || request.url.startsWith('assets/')
  // }
}

