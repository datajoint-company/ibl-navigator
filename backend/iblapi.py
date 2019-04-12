# iblapi.py: ibl data api for ibl-navigator

import os
import json
import logging

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
is_gunicorn = "gunicorn" in os.environ.get("SERVER_SOFTWARE", "")


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
    '_q': None,
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


@app.route(mkpath('/<path:subpath>'), methods=['GET', 'POST'])
def do_req(subpath):
    app.logger.info("method: '{}', path: {}, values: {}".format(
        request.method, request.path, request.values))

    pathparts = request.path.split('/')[2:]  # ['', 'v0'] [ ... ]
    obj = pathparts[0]

    args, limit, order, proj = request.values, None, None, None

    if '__json' in request.values:
        args = json.loads(request.values['__json'])

    if '__limit' in request.values:
        limit = int(request.values['__limit'])

    if '__order' in request.values:
        order = request.values['__order']

    if '__proj' in request.values:
        proj = json.loads(request.values['__proj'])

    kwargs = {i[0]: i[1] for i in (('as_dict', True,),
                                   ('limit', limit,),
                                   ('order_by', order,)) if i[1] is not None}

    if obj not in reqmap:
        abort(404)
    elif obj == '_q':
        return handle_q(pathparts[1], args, proj, **kwargs)
    else:
        q = (reqmap[obj] & args)
        if proj:
            q = q.proj(*proj)

        else:
            return dumps(q.fetch(**kwargs))


def handle_q(subpath, args, proj, **kwargs):
    '''
    special queries (under '/_q/ URL Space)
      - for sessionpage, provide:
        ((session * subject * lab * user) & arg).proj(flist)
    '''
    app.logger.info("handle_q: subpath: '{}', args: {}".format(subpath, args))

    ret = []
    if subpath == 'sessionpage':
        q = (acquisition.Session() * subject.Subject()
             & ((reference.Lab() * reference.LabMember())
                & reference.LabMembership().proj('lab_name', 'user_name')))
        if proj:
            ret = q.proj(*proj).fetch(**kwargs)
        else:
            ret = q.fetch(**kwargs)

    return json.dumps(ret)


if is_gunicorn:
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
