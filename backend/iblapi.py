# iblapi.py: ibl data api for ibl-navigator


import json
from datetime import date
from datetime import datetime

from flask import Flask
from flask import request
from flask import abort

from ibl_pipeline import subject
from ibl_pipeline import reference
from ibl_pipeline import action
# from ibl_pipeline import behavior
from ibl_pipeline import acquisition
# from ibl_pipeline import data
# from ibl_pipeline import ephys


API_VERSION = '0'
app = Flask(__name__)
API_PREFIX = '/v{}'.format(API_VERSION)


class DateTimeEncoder(json.JSONEncoder):
    ''' teach json to dump datetimes, etc '''
    def default(self, o):
        if isinstance(o, date):
            return o.isoformat()
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

    @classmethod
    def dumps(cls, obj):
        return json.dumps(obj, cls=cls)


# _start:
reqmap = {
    'lab': reference.Lab,
    'labmember': reference.LabMember,
    'labmembership': reference.LabMembership,
    'subject': subject.Subject,
    'session': acquisition.Session,
    'weighing': action.Weighing,
}
dumps = DateTimeEncoder.dumps


def mkpath(path):
    return '{}{}'.format(API_PREFIX, path)


@app.route(mkpath('/<path:subpath>'))
def do_req(subpath, methods=['GET', 'POST']):
    app.logger.debug("method: '{}', path: {}, values: {}".format(
        request.method, request.path, request.values))

    pathparts = request.path.split('/')[2:]  # ['', 'v0'] [ ... ]
    obj = pathparts[0]

    if obj not in reqmap:
        abort(404)
    else:
        return dumps((reqmap[obj] & request.values).fetch(as_dict=True))
