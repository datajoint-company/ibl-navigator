import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

var url = `https://${__ENV.SUBDOMAIN}.${__ENV.DOMAIN}/api/sessions`;
var bearer = __ENV.TOKEN;

export let errorRate = new Rate('errors');
export let options = {
    vus: __ENV.VUS,
    // duration: '90s',
    iterations: __ENV.VUS,
    // insecureSkipTLSVerify: true,
    thresholds: {
        errors: [`rate<=${__ENV.FAILURE_RATE}`], // <=20% errors
    },
};

export default function() {
    group('sessions', () => {
        var params = {
            headers: {
                'Authorization': 'Bearer ' + bearer,
                'Content-Type': 'application/json',
                'User-Agent': 'DataJoint',
            },
        };
        var data = {
            "__order": "session_start_time DESC"
        };
        const res = http.post(url, JSON.stringify(data), params);
        const result = check(res, {
            'status is 200': (r) => r.status == 200,
        });
        errorRate.add(!result);
    });
    sleep(1);
}