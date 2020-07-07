
// import http from "k6/http";
// import { sleep, check } from "k6";
// import runTestOne from "/tmp/k6_test1.js";

// export default function() {
//     runTestOne();
//     // runTestOne();
//     // runTestOne();
// };


import http from 'k6/http';
import { check, group, sleep } from 'k6';

var url = '';
var bearer = '';

// // export let options = {
// //     insecureSkipTLSVerify: true,
// //     execution: {
// //         scenario1: {
// //             // type: "per-vu-iterations",
// //             vus: 24,
// //             iterations: 24,
// //             maxDuration: "90s",
// //         },
// //     }
// // }

// // export default function() {
// //     console.log(`VU ${__VU}, iteration ${__ITER}`);
// //     group('sessions', () => {
// //         var params = {
// //             headers: {
// //                 'User-Agent': 'DataJoint',
// //                 'Authorization': 'Bearer ' + bearer,
// //             },
// //         };
// //         let r = http.get(url, params);
// //         check(r, {
// //             'status is 200': r.status === 200
// //         });
// //     });
// //     sleep(1);
// // }

// // // export default function() {

// // // }



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