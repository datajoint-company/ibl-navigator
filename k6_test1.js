import http from 'k6/http';
import { check, group, sleep } from 'k6';

var url = 'https://{{TEMP_HOST}}/api/sessions';
var bearer = '{{TEMP_TOKEN}}';

export let options = {
    vus: 24,
    // duration: '90s',
    iterations: 24,
    insecureSkipTLSVerify: true,
};

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