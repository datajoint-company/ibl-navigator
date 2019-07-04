# iblapi.py: ibl data api for ibl-navigator

import os
import json
import uuid
import logging

from uuid import UUID
from datetime import date
from datetime import datetime

import numpy as np
import datajoint as dj

from flask import Flask
from flask import request
from flask import abort

API_VERSION = '0'
app = Flask(__name__)
API_PREFIX = '/v{}'.format(API_VERSION)
is_gunicorn = "gunicorn" in os.environ.get("SERVER_SOFTWARE", "")


def mkvmod(mod):
    return dj.create_virtual_module(
        mod, dj.config.get('database.prefix', '') + 'ibl_{}'.format(mod))


subject = mkvmod('subject')
reference = mkvmod('reference')
action = mkvmod('action')
acquisition = mkvmod('acquisition')
plotting_behavior = mkvmod('plotting_behavior')
analyses_behavior = mkvmod('analyses_behavior')


class DateTimeEncoder(json.JSONEncoder):
    ''' teach json to dump datetimes, etc '''

    npmap = {
        np.bool_: bool,
        np.uint8: str,
        np.uint16: str,
        np.uint32: str,
        np.uint64: str,
        np.int8: str,
        np.int16: str,
        np.int32: str,
        np.int64: str,
        np.float32: str,
        np.float64: str,
    }

    def default(self, o):
        if isinstance(o, date):
            return o.isoformat()
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, uuid.UUID):
            return str(o)
        if type(o) in self.npmap:
            return self.npmap[type(o)](o)
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
    'sessionpsych': plotting_behavior.SessionPsychCurve,
    'sessionRTC': plotting_behavior.SessionReactionTimeContrast,
    'sessionRTTN': plotting_behavior.SessionReactionTimeTrialNumber,
    'waterweight': plotting_behavior.CumulativeSummary.WaterWeight,
    'TCsessionduration': plotting_behavior.CumulativeSummary.TrialCountsSessionDuration,
    'performanceRT': plotting_behavior.CumulativeSummary.PerformanceReactionTime,
    'contrastheatmap': plotting_behavior.CumulativeSummary.ContrastHeatmap,
    'fitpars': plotting_behavior.CumulativeSummary.FitPars,
    'datepsych': plotting_behavior.DatePsychCurve,
    'dateRTcontrast': plotting_behavior.DateReactionTimeContrast,
    'dateRTtrial': plotting_behavior.DateReactionTimeTrialNumber
}
dumps = DateTimeEncoder.dumps


def mkpath(path):
    return '{}{}'.format(API_PREFIX, path)


@app.route(mkpath('/<path:subpath>'), methods=['GET', 'POST'])
def do_req(subpath):
    app.logger.info("method: '{}', path: {}, values: {}".format(
        request.method, request.path, request.values))

    # 1) parse request & arguments
    pathparts = request.path.split('/')[2:]  # ['', 'v0'] [ ... ]
    obj = pathparts[0]

    values = request.values
    postargs, jsonargs = {}, None

    limit = int(request.values['__limit']) if '__limit' in values else None
    order = request.values['__order'] if '__order' in values else None
    proj = json.loads(request.values['__proj']) if '__proj' in values else None

    special_fields = ['__json', '__limit', '__order', '__proj']
    for a in (v for v in values if v not in special_fields):
        # HACK: 'uuid' attrs -> UUID type (see also: datajoint-python #594)
        postargs[a] = UUID(values[a]) if 'uuid' in a else values[a]

    args = [postargs] if len(postargs) else []
    if '__json' in values:
        jsonargs = json.loads(request.values['__json'])
        args += jsonargs if type(jsonargs) == list else [jsonargs]

    args = {} if not args else dj.AndList(args)
    kwargs = {i[0]: i[1] for i in (('as_dict', True,),
                                   ('limit', limit,),
                                   ('order_by', order,)) if i[1] is not None}

    # 2) and dispatch
    app.logger.debug("args: '{}', kwargs: {}".format(args, kwargs))
    if obj not in reqmap:
        abort(404)
    elif obj == '_q':
        return handle_q(pathparts[1], args, proj, **kwargs)
    else:
        q = (reqmap[obj] & args)
        if proj:
            q = q.proj(*proj)

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
        q = (acquisition.Session().aggr(
            # plotting_behavior.SessionPsychCurve(),
            plotting_behavior.SessionPsychCurve().proj(dummy='"x"') * dj.U('dummy'),
            #  nplot='count(distinct(concat(subject_uuid, session_start_time)))',
             nplot='count(dummy)',
             keep_all_rows=True)
             * acquisition.Session() * acquisition.SessionProject() * subject.Subject() * subject.SubjectLab() * subject.SubjectUser()
             & ((reference.Lab() * reference.LabMember())
                & reference.LabMembership().proj('lab_name', 'user_name'))
             & args)
    elif subpath == 'subjpage':
        print('Args are:', args)
        for e in args:
            if 'projects' in e:
                e['subject_project'] = e.pop('projects')
        projects = subject.Subject.aggr(subject.SubjectProject, projects='GROUP_CONCAT(DISTINCT subject_project'
        ' ORDER BY subject_project SEPARATOR ",")')
        proj_restr = (subject.SubjectProject & args).proj()
        q = (subject.Subject() * subject.SubjectLab() * subject.SubjectUser() * projects
             & args & proj_restr)
    elif subpath == 'dailysummary':
	    # find the latest summary geneartion for each lab
	    latest_summary = plotting_behavior.DailyLabSummary * dj.U('lab_name').aggr(
	    plotting_behavior.DailyLabSummary, latest_summary_date='max(last_session_time)') & 'last_session_time = latest_summary_date'
	    # identify mouse summary corresponding to the latest lab summary
	    mouse_we_care = plotting_behavior.DailyLabSummary.SubjectSummary & latest_summary
	    # get the latest plots
	    plots = plotting_behavior.CumulativeSummary.WaterWeight * plotting_behavior.CumulativeSummary.ContrastHeatmap * \
	    plotting_behavior.CumulativeSummary.TrialCountsSessionDuration * \
        plotting_behavior.CumulativeSummary.PerformanceReactionTime & plotting_behavior.SubjectLatestDate
	    # find latest plots for mouse with summary
	    q = plots * mouse_we_care & args
    else:
        abort(404)

    if proj:
        ret = q.proj(*proj).fetch(**kwargs)
    else:
        ret = q.fetch(**kwargs)

    return dumps(ret)


if is_gunicorn:
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
