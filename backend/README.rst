
======
iblapi
======

REST Data API for IBL Web UI
Python/Datajoint/Flask

usage - flask internal dev server::

  FLASK_APP=./iblapi.py flask run
  or
  ./run-api  # shell script of above
  or
  ./run-api development  # prints extra debug information

usage - gunicorn multiprocess server::

  $ gunicorn -w 4 -b 0.0.0.0:5000 iblapi-gunicorn
  or
  $ ./run-api-gunicorn

api specification
=================

All API endpoints documented here are under a version prefix; currently '/v0',
so, if an endpoint is documented as '/stuff', the real URL would be '/v0/stuff'.

WIP draft v0.1 api spec::

  Requests
  currently support 'GET' and 'POST' methods; documented as GET urlparams
  
    /labmember:                         list of lab members
    /labmember/?user_name=...:          specific user
    /lab:                               list of labs
    /lab/?lab_name=...:                 lab info
    /labmembership/?:                   lab membership
    /subject:                           list of subjects
    /session:                           list of subjects
    /session/?subject_nickname:         specific subject
    /session/?subject_uuid:             specific subject

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
