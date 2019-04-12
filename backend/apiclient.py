#! /usr/bin/env python

import sys

from code import interact

from requests import post as http_post


API_VERSION = '0'
api_endpoint = 'http://localhost:5000/v' + API_VERSION


def post(subpath='/', data={}):
    r = http_post('{}{}'.format(api_endpoint, subpath), data=data)
    return r.json()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        api_endpiont = sys.argv[1]

    print("apiclient - use 'post(/'subpath', data={})' to test get requests")
    interact('apiclient', local=locals())
