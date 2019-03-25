
# todo: better test data via leveraging ibl pipeline code
 
from ibl_pipeline import reference
from ibl_pipeline import subject
from ibl_pipeline import action
from ibl_pipeline import behavior
from ibl_pipeline import acquisition
from ibl_pipeline import data
from ibl_pipeline import ephys


def mkdata():
    reference.Lab.insert1({
        'lab_name': 'testlab',
        'lab_uuid': 'E67C1150-B088-4C0E-8303-89E8DDDC5B9E',
        'institution': 'biginst',
        'address': '1234 biginst way',
        'time_zone': 'GMT',
        'reference_weight_pct': 0.0,
        'zscore_weight_pct': 0.0
    }, skip_duplicates=True)
    subject.Subject.insert1({
        'lab_name': 'testlab',
        'subject_nickname': 'dm',
        'subject_uuid': '0EAB2592-F6CA-45C1-9F32-900EC2E08A90',
        'sex': 'M',
        'protocol_number': 0
    }, skip_duplicates=True)
    reference.LabMember.insert1({
        'user_name': 'jqs',
        'user_uuid': '06009233-F1EB-4C42-9C9E-6CFC83268338',
        'password': 'iforgotcanuresetitforme',
        'email': 'jqs@scients.org',
        'last_login': '2010-01-01',
        'first_name': 'j.q.',
        'last_name': 'scientist',
        'date_joined': '2000-01-01',
        'is_active': True,
        'is_staff': True,
        'is_superuser': False,
        'is_stock_manager': False,
        # 'groups=null':
        # 'user_permissions=null':
    }, skip_duplicates=True)
    reference.LabMembership.insert1({
        'lab_name': 'testlab',
        'user_name': 'jqs',
        'lab_membership_uuid': '4CFCBAD4-21EB-4600-B32A-BB32D53F33A4',
        # 'role=null'
        'mem_start_date': '2019-01-01',
        'mem_end_date': '2025-01-01',
    }, skip_duplicates=True)
