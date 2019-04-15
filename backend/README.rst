
======
iblapi
======

REST Data API for IBL Web UI
Python/Datajoint/Flask

usage - flask internal dev server::

  FLASK_APP=./iblapi.py flask run
  or
  ./run-ibl-api.dev.sh  # shell script of above
  or
  ./run-ibl-api.dev.sh development  # prints extra debug information

usage - gunicorn multiprocess server::

  $ gunicorn -w 4 -b 0.0.0.0:5000 iblapi-gunicorn
  or
  $ ./run-ibl-api.prod.sh
  devel logs:
  $ gunicorn -w 4 -b 0.0.0.0:5000 iblapi-gunicorn --log-level=debug
  or
  $ ./run-ibl-api.prod.sh development

api specification
=================

All API endpoints documented here are under a version prefix; currently '/v0',
so, if an endpoint is documented as '/stuff', the real URL would be '/v0/stuff'.

Special facilities are provided via the following special arguments:

  *'__json'*

  If the `__json` attribute is present, the result of decoding its
  value via `json.loads()` will be used instead of other query arguments.

  This facillitates use of list values (dj.AndList), multiple restrictions,
  and query-by-string.

  *'__limit'*

  If the `__limit` attribute is present, its decoded integer value `N` will
  be passed into the DatajointQuery as a `limit=N` argument.

  *'__order'*

  If the `__order` attribute is present, its string value `S` will
  be passed into the DatajointQuery as a `order_by=S` argument.

  *'__proj'*

  If the `__proj` attribute is present, the result of decoding its value via
  `json.loads()` into `args` will be used to project out the query results as
  `.proj(*args)` before they are returned to the client.

WIP draft v0.1 api spec::

  Requests
  currently support 'POST' methods; documented here as GET urlparams

  base tables::
  
    /labmember:                         list of lab members
    /labmember/?user_name=...:          specific user
    /lab:                               list of labs
    /lab/?lab_name=...:                 lab info
    /labmembership/?:                   lab membership
    /subject:                           list of subjects
    /session:                           list of subjects
    /session/?subject_nickname:         specific subject
    /session/?subject_uuid:             specific subject

  special queries (under '_q' prefix)::

    /_q/sessionpage:                    session * subject * lab * labmember

todo?::

    /user/<username>/subjects:          subjects with user ownership
    /lab/<labname>/users:               lab users
    /lab/<labname>/subjects:            lab subjects
    /subject:                           list of subjects
    /subject/<subjectname>:             subject information
    /subject/<subjectname>/<weighings>
    /sessions:                          list of sessions
    /sessions/?subject_nickname:        sessions for subject
    /sessions/?session_start_time:      specific session start time
    /weighing:                          list of subjects
    /plot/<plotname>/<session>:         data for plotting
  
currently, API is read-only.
