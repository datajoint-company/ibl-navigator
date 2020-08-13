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

import boto3
s3_client = boto3.client('s3')

API_VERSION = '0'
app = Flask(__name__)
API_PREFIX = '/v{}'.format(API_VERSION)
is_gunicorn = "gunicorn" in os.environ.get("SERVER_SOFTWARE", "")


def mkvmod(mod):
    return dj.create_virtual_module(
        mod, dj.config.get('database.prefix', '') + 'ibl_{}'.format(mod))

def test_mkvmod(mod):
    return dj.create_virtual_module(
        mod, dj.config.get('database.prefix', '') + 'test_ibl_{}'.format(mod))


subject = mkvmod('subject')
reference = mkvmod('reference')
action = mkvmod('action')
acquisition = mkvmod('acquisition')
plotting_behavior = mkvmod('plotting_behavior')
analyses_behavior = mkvmod('analyses_behavior')
plotting_ephys = mkvmod('plotting_ephys')
test_plotting_ephys = test_mkvmod('plotting_ephys')
ephys = mkvmod('ephys')
histology = mkvmod('histology')
test_histology = test_mkvmod('histology')
original_max_join_size = dj.conn().query(
    "show variables like 'max_join_size'").fetchall()[0][1]

dj.config['stores'] = {
    'ephys': dict(
        protocol='s3',
        endpoint='s3.amazonaws.com',
        access_key=os.environ.get('AWS_ACCESS_KEY_ID'),
        secret_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        bucket='ibl-dj-external',
        location='/ephys'
    ),
    'plotting': dict(
        protocol='s3',
        endpoint='s3.amazonaws.com',
        access_key=os.environ.get('AWS_ACCESS_KEY_ID'),
        secret_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        bucket='ibl-dj-external',
        location='/plotting'
    )
}

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
        np.ndarray: list
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
    '_health': None,
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
    'dateRTtrial': plotting_behavior.DateReactionTimeTrialNumber,
    'clustermetrics': ephys.DefaultCluster.Metrics,
    # 'cluster': ephys.Cluster,
    'goodcluster': ephys.GoodCluster,
    'goodclustercriterion': ephys.GoodClusterCriterion,
    ## 'raster': plotting_ephys.Raster,
    ## 'psth': plotting_ephys.Psth,
    # 'psthdata': plotting_ephys.PsthDataVarchar,
    'psthdata': plotting_ephys.Psth, 
    'psthtemplate': plotting_ephys.PsthTemplate,
    # 'rasterlight': plotting_ephys.RasterLinkS3,
    # 'rasterlight': plotting_ephys.Raster,
    'rastertemplate': plotting_ephys.RasterLayoutTemplate,
    'probeinsertion': ephys.ProbeInsertion,
    # 'fulldriftmap': test_plotting_ephys.DepthRaster, # originally the DriftMap
    'fulldriftmaptemplate': plotting_ephys.DepthRasterTemplate, # originally the DriftMapTemplate
    'depthpethtemplate': plotting_ephys.DepthPethTemplate, # for depth peth plot
    'autocorrelogram': plotting_ephys.AutoCorrelogram,
    'ACGtemplate': plotting_ephys.AutoCorrelogramTemplate,
    'spikeamptimetemplate': plotting_ephys.SpikeAmpTimeTemplate,
    'waveformtemplate': plotting_ephys.WaveformTemplate,
    # 'depthbrainregions': test_histology.DepthBrainRegion,

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
    elif obj == '_health':
        return dumps(dict(healthy=True))
    else:
        q = (reqmap[obj] & args)
        if proj:
            q = q.proj(*proj)

        from time import time
        start = time()
        print('about to fetch requested object')
        print(start)
        fetched = q.fetch(**kwargs)
        dur = time() - start
        print('Took {} seconds to fetch dataset'.format(dur))
        return dumps(fetched)
        # return dumps(q.fetch(**kwargs))
        


def handle_q(subpath, args, proj, **kwargs):
    '''
    special queries (under '/_q/ URL Space)
      - for sessionpage, provide:
        ((session * subject * lab * user) & arg).proj(flist)
    '''
    app.logger.info("handle_q: subpath: '{}', args: {}".format(subpath, args))

    ret = []
    post_process = None
    if subpath == 'sessionpage':
        sess_proj = acquisition.Session().aggr(
            acquisition.SessionProject().proj('session_project', dummy2='"x"')
            * dj.U('dummy2'),
            session_project='IFNULL(session_project, "unassigned")',
            keep_all_rows=True
        )
        psych_curve = acquisition.Session().aggr(
            # plotting_behavior.SessionPsychCurve(),
            plotting_behavior.SessionPsychCurve().proj(dummy='"x"') * dj.U('dummy'),
            #  nplot='count(distinct(concat(subject_uuid, session_start_time)))',
            nplot='count(dummy)',
            keep_all_rows=True)
        ephys_data = acquisition.Session().aggr(
            ephys.ProbeInsertion().proj(dummy2='"x"') * dj.U('dummy2'),
            nprobe='count(dummy2)',
            keep_all_rows=True)
        training_status = acquisition.Session.aggr(
            analyses_behavior.SessionTrainingStatus.proj(dummy3='"x"') * dj.U('dummy3'),
            nstatus='count(dummy3)',
            keep_all_rows=True)

        q = (acquisition.Session() * sess_proj * psych_curve * ephys_data * training_status
             * subject.Subject() * subject.SubjectLab()
             & (reference.Lab() * reference.LabMember()
                & reference.LabMembership().proj('lab_name', 'user_name'))
             & args)
        dj.conn().query("SET SESSION max_join_size={}".format('18446744073709551615'))
        q = q.proj(*proj).fetch(**kwargs) if proj else q.fetch(**kwargs)
        dj.conn().query("SET SESSION max_join_size={}".format(original_max_join_size))
    elif subpath == 'subjpage':
        print('Args are:', args)
        proj_restr = None
        for e in args:
            if 'projects' in e and e['projects'] != 'unassigned':
                proj_restr = {'subject_project': e.pop('projects')}

        projects = subject.Subject.aggr(subject.SubjectProject, projects='GROUP_CONCAT(DISTINCT subject_project'
                                        ' ORDER BY subject_project SEPARATOR ",")', keep_all_rows=True).proj(projects='IFNULL(projects, "unassigned")')

        if proj_restr is not None:
            proj_restr = (subject.SubjectProject & proj_restr).proj()
        else:
            proj_restr = {}

        ready4delay = subject.Subject().aggr(
            (analyses_behavior.SessionTrainingStatus() & 'training_status = "ready4delay"'),
            ready4delay='count(training_status)',
            keep_all_rows=True)
        
        lab_name = subject.Subject.aggr(subject.SubjectLab(), lab_name='IFNULL(lab_name, "missing")', keep_all_rows=True)
        user_name = subject.Subject.aggr(subject.SubjectUser(), responsible_user='IFNULL(responsible_user, "unassigned")')

        dead_mice = subject.Subject().aggr(
            # subject.Death().proj(dummy='"x"') * dj.U('dummy'),
            subject.Death().proj('death_date') * dj.U('death_date'),
            death_date='IFNULL(death_date, 0)',
            keep_all_rows=True)
        
        q = subject.Subject() * dead_mice *lab_name * user_name * projects * ready4delay & args & proj_restr
    elif subpath == 'dailysummary':
        # find the latest summary geneartion for each lab
        latest_summary = plotting_behavior.DailyLabSummary * dj.U('lab_name').aggr(
            plotting_behavior.DailyLabSummary, latest_summary_date='max(last_session_time)') & 'last_session_time = latest_summary_date'
        # identify mouse summary corresponding to the latest lab summary
        mouse_we_care = plotting_behavior.DailyLabSummary.SubjectSummary & latest_summary

        proj_restr = None
        for e in args:
            if 'projects' in e and e['projects'] != 'unassigned':
                proj_restr = {'subject_project': e.pop('projects')}
        if proj_restr is not None:
            proj_restr = (subject.SubjectProject & proj_restr).proj()
        else:
            proj_restr = {}

        projects = mouse_we_care.aggr(subject.SubjectProject, projects='GROUP_CONCAT(DISTINCT subject_project'
                                    ' ORDER BY subject_project SEPARATOR ",")', keep_all_rows=True).proj(projects='IFNULL(projects, "unassigned")')

        # get the latest plots
        plots = plotting_behavior.CumulativeSummary.WaterWeight * plotting_behavior.CumulativeSummary.ContrastHeatmap * \
            plotting_behavior.CumulativeSummary.TrialCountsSessionDuration * \
            plotting_behavior.CumulativeSummary.PerformanceReactionTime & plotting_behavior.SubjectLatestDate
        # find latest plots for mouse with summary
        q = plots * mouse_we_care * projects & args & proj_restr
    elif subpath == 'clusternavplot':
        # print('fetching cluster plot info...')

        # specify attributes to exclude from the fetch to save bandwidth (in case no "proj" specified)
        exclude_attrs = ('-cluster_waveforms', '-cluster_waveforms_channels', '-cluster_peak_to_trough', '-cluster_spikes_templates',
                         '-cluster_spikes_times', '-cluster_spikes_depths', '-cluster_spikes_amps', '-cluster_spikes_samples')
        
        # q = (ephys.Cluster & args).proj(..., *exclude_attrs) * ephys.Cluster.ClusterMetrics.proj('firing_rate')
        q = (ephys.DefaultCluster & args).proj(..., *exclude_attrs) * ephys.DefaultCluster.Metrics.proj('firing_rate') 
        print(q)
    elif subpath == 'probetrajectory':
        traj = histology.ProbeTrajectory * histology.InsertionDataSource

        traj_latest = traj * (dj.U('subject_uuid', 'session_start_time', 'probe_idx', 'provenance') & \
                      (ephys.ProbeInsertion & args).aggr(traj, provenance='max(provenance)'))
        # x, y, z, phi, theta, depth, roll, trajectory_source = traj_latest.fetch1('x', 'y', 'z', 'phi', 'theta', 'depth', 'roll', 'insertion_data_source')
        # q = traj_latest.fetch1('x', 'y', 'z', 'phi', 'theta', 'depth', 'roll', 'insertion_data_source')
        q = traj * (dj.U('subject_uuid', 'session_start_time', 'probe_idx', 'provenance') & \
                      (ephys.ProbeInsertion & args).aggr(traj, provenance='max(provenance)'))
    elif subpath == 'rasterlight':
        # q = plotting_ephys.RasterLinkS3 & args
        q = plotting_ephys.Raster & args # temp test table
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '' and parsed_item['plotting_data_link'] != None:  # if empty link or NULL, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
            # return [{k: s3_client.generate_presigned_url(
            #         'get_object', 
            #         Params={'Bucket': 'ibl-dj-external', 'Key': v}, 
            #         ExpiresIn=3*60*60) if k == 'plotting_data_link' else v for k,v in i.items()}
            #         for i in ret]
    elif subpath == 'fulldriftmap':
        # q = test_plotting_ephys.DepthRaster & args
        q = plotting_ephys.DepthRaster & args 
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                if parsed_item['plotting_data_link_low_res'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link_low_res'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link_low_res']},
                                                        ExpiresIn=3*60*60)
                if parsed_item['plotting_data_link_very_low_res'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link_very_low_res'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link_very_low_res']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
    elif subpath == 'depthrastertrial':
        q = plotting_ephys.DepthRasterExampleTrial & args 
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
    elif subpath == 'depthpeth':
        q = plotting_ephys.DepthPeth & args 
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
    elif subpath == 'spikeamptime':
        q = plotting_ephys.SpikeAmpTime & args 
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
    elif subpath == 'waveform':
        q = plotting_ephys.Waveform & args 
        def post_process(ret):
            parsed_items = []
            for item in ret:
                parsed_item = dict(item)
                if parsed_item['plotting_data_link'] != '':  # if empty link, skip
                    parsed_item['plotting_data_link'] = \
                        s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'ibl-dj-external', 'Key': parsed_item['plotting_data_link']},
                                                        ExpiresIn=3*60*60)
                parsed_items.append(parsed_item)
            return parsed_items
    elif subpath == 'depthbrainregions':
        depth_region = histology.DepthBrainRegion * histology.InsertionDataSource

        q = depth_region * (dj.U('subject_uuid', 'session_start_time', 'probe_idx', 'provenance') & 
                      (ephys.ProbeInsertion & args).aggr(depth_region, provenance='max(provenance)'))
    else:
        abort(404)

    ret = q if isinstance(q, (list, dict)) else (q.proj(*proj).fetch(**kwargs)
                                                 if proj else q.fetch(**kwargs))

    # print('D type', ret.dtype)
    # print(ret)
    print('About to return ', len(ret), 'entries')
    return dumps(post_process(ret)) if post_process else dumps(ret)


if is_gunicorn:
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
