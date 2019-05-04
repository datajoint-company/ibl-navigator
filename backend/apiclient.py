#! /usr/bin/env python

import sys
import json

from code import interact

import datajoint as dj
from requests import post as http_post


API_VERSION = '0'
api_endpoint = 'http://localhost:5000/v' + API_VERSION


def mkvmod(mod):
    return dj.create_virtual_module(
        mod, dj.config.get('database.prefix', '') + 'ibl_{}'.format(mod))


def postdbg(subpath='/', data={}):
    return http_post('{}{}'.format(api_endpoint, subpath), data=data)


def post(subpath='/', data={}):
    r = http_post('{}{}'.format(api_endpoint, subpath), data=data)
    return r.json()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        api_endpiont = sys.argv[1]

    print("apiclient")
    print("  - use 'post('/subpath', data={})' to test get requests")
    print("  - use 'vmod('dbmodule')' to return ibl pipeline virtual modules")
    interact('apiclient', local=locals())
