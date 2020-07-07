import http from 'k6/http';
import { check, group, sleep } from 'k6';

var url = '';
var bearer = '';


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