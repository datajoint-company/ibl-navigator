#! /usr/bin/env python

import sys

from code import interact

from requests import get as http_get

from iblapi import API_VERSION


api_endpoint = 'http://localhost:5000/v' + API_VERSION


def get(subpath='/'):
    r = http_get('{}{}'.format(api_endpoint, subpath))
    return r.json()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        api_endpiont = sys.argv[1]

    print("apiclient - use 'get(/'subpath')' to test get requests")
    interact('apiclient', local=locals())
