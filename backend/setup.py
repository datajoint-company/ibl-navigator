#! /usr/bin/env python

from setuptools import setup, find_packages
from os import path
import sys

here = path.abspath(path.dirname(__file__))

long_description = """"
ibl-api server
see README.rst for further information.
"""

with open(path.join(here, 'requirements.txt')) as f:
    requirements = f.read().split()

setup(
    name='iblapi',
    version='0.0.1',
    description="iblapi server",
    long_description=long_description,
    author='TODO: Correct Attribution',
    author_email='TODO: Correct Maintainer Email',
    license='TODO: Resolve',
    url='https://github.com/vathes/ibl-navigator',
    keywords='datajoint mysql ibl',
    packages=find_packages(exclude=['contrib', 'docs', 'tests*']),
    scripts=['run-ibl-api.dev.sh', 'run-ibl-api.prod.sh'],
    install_requires=requirements,
)
