import http from 'k6/http';
import { check, group, sleep } from 'k6';

var url = 'https://ec2-35-174-113-72.compute-1.amazonaws.com/api/sessions';
var bearer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImlibHVzZXIiLCJpYXQiOjE1OTM0NTE5MzUsImV4cCI6MTU5MzUzODMzNX0.kStpG9M-C51sIvkFcsaRlE4dqntOoSuP02bZaMT9ny4';


export default function() {
    group('sessions', () => {
        var params = {
            headers: {
                'User-Agent': 'DataJoint',
                'Authorization': 'Bearer ' + bearer,
            },
        };
        let r = http.get(url, params);
        check(r, {
            'status is 200': r.status === 200
        });
    });
    sleep(1);
}