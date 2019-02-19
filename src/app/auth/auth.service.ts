// temporary login service here
export class AuthService {
    isLoggedIn = false;
    isAuthenticated() {
        const promise = new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    resolve(this.isLoggedIn); // to mimic server response time
                }, 300);
            }
        );
        return promise;
    }

    login(username, password) {
        if (username === 'test' && password === '1234') {
            this.isLoggedIn = true;
        } else {
            console.log('wrong login combo');
        }
    }

    logout() {
        this.isLoggedIn = false;
    }
}
