import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.backend_url;

// temporary login service here
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient,
                private router: Router) {}
    private token: string;
    private authStatusListener = new Subject<any>();
    private tokenTimer;
    isLoggedIn = false;
    loginFail;

    isAuthenticated() {
        return this.isLoggedIn;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    login(username: string, password: string, returnUrl: string) {
        console.log('auth service loggin user in: ', username);
        const authData: AuthData = {username: username, password: password};
        // const authData = {username: username, password: password};
        this.http.post(BACKEND_URL + `/login`, authData)
            .subscribe(response => {
                console.log('printing response from backend');
                console.log(response);
                this.token = response['token'];
                if (response['token']) {
                    this.isLoggedIn = true;
                    this.loginFail = false;
                    // this.authStatusListener.next(true);
                    this.authStatusListener.next([this.isLoggedIn, this.loginFail]);
                    this.setAuthTimer(response['expiresIn']);
                    const now = new Date();
                    const expDate = new Date(now.getTime() + response['expiresIn']);
                    // console.log('log in data expires on: ', expDate);
                    this.saveAuthData(response['token'], expDate);
                    this.router.navigateByUrl(returnUrl);
                } else {
                    console.log('wrong login combo');
                    this.loginFail = true;
                    this.isLoggedIn = false;
                    this.authStatusListener.next([this.isLoggedIn, this.loginFail]);
                    this.router.navigate(['/']);
                }
            });

        // if (username === 'test' && password === '1234') {
        //     this.isLoggedIn = true;
        // } else {
        //     console.log('wrong login combo');
        // }
    }

    logout() {
        this.token = null;
        this.isLoggedIn = false;
        this.loginFail = false;
        // this.authStatusListener.next(false);
        this.authStatusListener.next([this.isLoggedIn, this.loginFail]);
        this.clearAuthData();
        clearTimeout(this.tokenTimer);
        this.router.navigate(['/']);
    }

    getToken() {
        return this.token;
    }

    autoLoginUser() {
        const authInfo = this.retrieveAuthData();
        const now = new Date();
        if (authInfo) {
            const expiresIn = authInfo.expDate.getTime() - now.getTime();
            if (expiresIn > 0) {
                this.token = authInfo.token;
                this.setAuthTimer(expiresIn);
                this.isLoggedIn = true;
                // this.authStatusListener.next(true);
                this.authStatusListener.next([this.isLoggedIn, null]);
            } else {
                this.isLoggedIn = false;
                // this.authStatusListener.next(false);
                this.authStatusListener.next([this.isLoggedIn, null]);
            }
        }
    }

    private setAuthTimer(duration: number) {
        // console.log('setting timer for: ', duration, 'ms from now');
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration);
    }

    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem( 'token', token);
        localStorage.setItem( 'expiration', expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

    private retrieveAuthData() {
        const token = localStorage.getItem('token');
        const expDate = localStorage.getItem('expiration');
        if (token && expDate) {
            return {
                token: token,
                expDate: new Date(expDate)};
        } else {
            return;
        }
    }
}
