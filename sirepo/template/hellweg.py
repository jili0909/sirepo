# -*- coding: utf-8 -*-
u"""Hellweg execution template.

:copyright: Copyright (c) 2017 RadiaSoft LLC.  All Rights Reserved.
:license: http://www.apache.org/licenses/LICENSE-2.0.html
"""

from __future__ import absolute_import, division, print_function
from pykern import pkcollections
from pykern import pkio
from pykern import pkjinja
from pykern.pkdebug import pkdc, pkdp
from sirepo import simulation_db
from sirepo.template import template_common, hellweg_dump_reader
import numpy
import os.path
import re

HELLWEG_DUMP_FILE = 'all-data.bin'

HELLWEG_SUMMARY_FILE = 'output.txt'

#: Simulation type
SIM_TYPE = 'hellweg'

WANT_BROWSER_FRAME_CACHE = True

# lattice element is required so make it very short and wide drift
_DEFAULT_DRIFT_ELEMENT = 'DRIFT 1e-16 1e+16 2' + "\n"

_HELLWEG_PARSED_FILE = 'PARSED.TXT'


def background_percent_complete(report, run_dir, is_running, schema):
    if is_running:
        return {
            'percentComplete': 0,
            'frameCount': 0,
        }
    dump_file = _dump_file(run_dir)
    if os.path.exists(dump_file):
        beam_header = hellweg_dump_reader.beam_header(dump_file)
        last_update_time = int(os.path.getmtime(dump_file))
        frame_count = beam_header.NPoints
        return {
            'lastUpdateTime': last_update_time,
            'percentComplete': 100,
            'frameCount': frame_count,
            'summaryData': _summary_text(run_dir),
        }
    return {
        'percentComplete': 100,
        'frameCount': 0,
        'error': _parse_error_message(run_dir)
    }


def copy_related_files(data, source_path, target_path):
    pass


def extract_beam_histrogram(report, run_dir, frame):
    beam_info = hellweg_dump_reader.beam_info(_dump_file(run_dir), frame)
    points = hellweg_dump_reader.get_points(beam_info, report.reportType)
    hist, edges = numpy.histogram(points, template_common.histogram_bins(report.histogramBins))
    return {
        'title': _report_title(report.reportType, simulation_db.get_schema(SIM_TYPE)['enum']['BeamHistogramReportType'], beam_info),
        'x_range': [edges[0], edges[-1]],
        'y_label': 'Number of Particles',
        'x_label': hellweg_dump_reader.get_label(report.reportType),
        'points': hist.T.tolist(),
    }


def extract_beam_report(report, run_dir, frame):
    beam_info = hellweg_dump_reader.beam_info(_dump_file(run_dir), frame)
    x, y = report.reportType.split('-')
    data_list = [
        hellweg_dump_reader.get_points(beam_info, x),
        hellweg_dump_reader.get_points(beam_info, y),
    ]
    hist, edges = numpy.histogramdd(data_list, template_common.histogram_bins(report.histogramBins))
    return {
        'x_range': [float(edges[0][0]), float(edges[0][-1]), len(hist)],
        'y_range': [float(edges[1][0]), float(edges[1][-1]), len(hist[0])],
        'x_label': hellweg_dump_reader.get_label(x),
        'y_label': hellweg_dump_reader.get_label(y),
        'title': _report_title(report.reportType, simulation_db.get_schema(SIM_TYPE)['enum']['BeamReportType'], beam_info),
        'z_matrix': hist.T.tolist(),
        'z_label': 'Number of Particles',
        'summaryData': _summary_text(run_dir),
    }


def fixup_old_data(data):
    pass


def get_animation_name(data):
    return 'animation'


def lib_files(data, source_lib):
    res = []
    return template_common.internal_lib_files(res, source_lib)


def get_simulation_frame(run_dir, data, model_data):
    frame_index = int(data['frameIndex'])
    args = data['animationArgs'].split('_')
    if data['modelName'] == 'beamAnimation':
        return extract_beam_report(
            pkcollections.Dict({
                'reportType': args[0],
                'histogramBins': args[1],
            }),
            run_dir,
            frame_index,
        )
    elif data['modelName'] == 'beamHistogramAnimation':
        return extract_beam_histrogram(
            pkcollections.Dict({
                'reportType': args[0],
                'histogramBins': args[1],
            }),
            run_dir,
            frame_index,
        )
    raise RuntimeError('unknown animation model: {}'.format(data['modelName']))


def models_related_to_report(data):
    """What models are required for this data['report']

    Args:
        data (dict): simulation
    Returns:
        list: Named models, model fields or values (dict, list) that affect report
    """
    r = data['report']
    if r == 'animation':
        return []
    return [
        r,
        'beam',
        'ellipticalDistribution',
        'energyPhaseDistribution',
        'solenoid',
        'sphericalDistribution',
        'twissDistribution',
    ]


def new_simulation(data, new_simulation_data):
    pass


def python_source_for_model(data, model):
    return '''
from rslinac.solver import BeamSolver

{}

with open('input.txt', 'w') as f:
    f.write(input_file)

with open('defaults.ini', 'w') as f:
    f.write(ini_file)

solver = BeamSolver('defaults.ini', 'input.txt')
solver.solve()
solver.save_output('output.txt')
    '''.format(_generate_parameters_file(data, is_parallel=True))


def prepare_aux_files(run_dir, data):
    pass


def prepare_for_client(data):
    return data


def prepare_for_save(data):
    return data


def resource_files():
    """Library shared between simulations of this type

    Returns:
        list: py.path.local objects
    """
    return []


def remove_last_frame(run_dir):
    pass


def write_parameters(data, schema, run_dir, is_parallel):
    """Write the parameters file

    Args:
        data (dict): input
        schema (dict): to validate data
        run_dir (py.path): where to write
        is_parallel (bool): run in background?
    """
    pkio.write_text(
        run_dir.join(template_common.PARAMETERS_PYTHON_FILE),
        _generate_parameters_file(
            data,
            run_dir,
            is_parallel,
        ),
    )


def _dump_file(run_dir):
    return os.path.join(str(run_dir), HELLWEG_DUMP_FILE)


def _generate_beam(models):
    # BEAM SPH2D 0.564 -15 5 NORM2D 0.30 0.0000001 90 180
    return 'BEAM {} {}'.format(_generate_transverse_dist(models), _generate_longitude_dist(models))


def _generate_cell_params(el):
    #TODO(pjm): add an option field to select auto-calculate
    if el.attenuation == 0 and el.aperture == 0:
        return '{} {} {}'.format(el.phaseAdvance, el.phaseVelocity, el.acceleratingInvariant)
    return '{} {} {} {} {}'.format(el.phaseAdvance, el.phaseVelocity, el.acceleratingInvariant, el.attenuation, el.aperture)


def _generate_charge(models):
    if models.beam.spaceCharge == 'none':
        return ''
    return 'SPCHARGE {} {}'.format(models.beam.spaceCharge.upper(), models.beam.spaceChargeCore)


def _generate_current(models):
    return 'CURRENT {} {}'.format(models.beam.current, models.beam.numberOfParticles)


def _generate_lattice(models):
    res = ''
    for el in models.beamline:
        if el.type == 'powerElement':
            res += 'POWER {} {} {}'.format(el.inputPower, el.frequency, el.phaseShift)
        elif el.type == 'cellElement':
            res += 'CELL {}'.format(_generate_cell_params(el))
            has_cell_or_drift = True
        elif el.type == 'cellsElement':
            res += 'CELLS {} {}'.format(el.repeat, _generate_cell_params(el))
            has_cell_or_drift = True
        elif el.type == 'driftElement':
            res += 'DRIFT {} {} {}'.format(el.length, el.radius, el.meshPoints)
            has_cell_or_drift = True
        elif el.type == 'saveElement':
            #TODO(pjm): implement this
            pass
        else:
            raise RuntimeError('unknown element type: {}'.format(el.type))
        res += "\n"
    return res


def _generate_longitude_dist(models):
    if models.beam.longitudinalDistribution == 'norm2d':
        dist = models.energyPhaseDistribution
        if models.energyPhaseDistribution.distributionType == 'uniform':
            return 'NORM2D {} {} {} {}'.format(
                dist.meanEnergy, dist.energySpread, dist.meanPhase, dist.phaseLength)
        if models.energyPhaseDistribution.distributionType == 'gaussian':
            return 'NORM2D {} {} {} {} {} {}'.format(
                dist.meanEnergy, dist.energySpread, dist.energyDeviation, dist.meanPhase, dist.phaseLength, dist.phaseDeviation)
        raise RuntimeError('unknown longitudinal distribution type: {}'.format(models.longitudinalDistribution.distributionType))
    raise RuntimeError('unknown longitudinal distribution: {}'.format(models.beam.longitudinalDistribution))


def _generate_options(models):
    if models.simulationSettings.allowBackwardWaves == '1':
        return 'OPTIONS REVERSE'
    return ''


def _generate_parameters_file(data, run_dir=None, is_parallel=False):
    template_common.validate_models(data, simulation_db.get_schema(SIM_TYPE))
    v = template_common.flatten_data(data['models'], {})
    v['optionsCommand'] = _generate_options(data['models'])
    v['solenoidCommand'] = _generate_solenoid(data['models'])
    v['beamCommand'] = _generate_beam(data['models'])
    v['currentCommand'] = _generate_current(data['models'])
    v['chargeCommand'] = _generate_charge(data['models'])
    if is_parallel:
        v['latticeCommands'] = _generate_lattice(data['models'])
    else:
        v['latticeCommands'] = _DEFAULT_DRIFT_ELEMENT
    return pkjinja.render_resource('hellweg.py', v)


def _generate_solenoid(models):
    solenoid = models.solenoid
    if solenoid.sourceDefinition == 'none':
        return ''
    if solenoid.sourceDefinition == 'values':
        #TODO(pjm): latest version also has solenoid.fringeRegion
        return 'SOLENOID {} {} {}'.format(
            solenoid.fieldStrength, solenoid.length, solenoid.z0)
    raise RuntimeError('unknown solenoidDefinition: {}'.format(solenoid.solenoidDefinition))


def _generate_transverse_dist(models):
    dist_type = models.beam.transversalDistribution
    if dist_type == 'twiss4d':
        dist = models.twissDistribution
        return 'TWISS4D {} {} {} {} {} {}'.format(
            dist.horizontalAlpha, dist.horizontalBeta, dist.horizontalEmittance,
            dist.verticalAlpha, dist.verticalBeta, dist.verticalEmittance)
    if dist_type == 'sph2d':
        dist = models.sphericalDistribution
        if dist.curvature == 'flat':
            dist.curvatureFactor = 0
        return 'SPH2D {} {} {}'.format(dist.radialLimit, dist.curvatureFactor, dist.thermalEmittance)
    if dist_type == 'ell2d':
        dist = models.ellipticalDistribution
        return 'ELL2D {} {} {} {}'.format(dist.aX, dist.bY, dist.rotationAngle, dist.rmsDeviationFactor)
    raise RuntimeError('unknown transverse distribution: {}'.format(dist_type))


def _parse_error_message(run_dir):
    path = os.path.join(str(run_dir), _HELLWEG_PARSED_FILE)
    if not os.path.exists(path):
        return 'No elements generated'
    text = pkio.read_text(str(path))
    for line in text.split("\n"):
        match = re.search('^ERROR:\s(.*)$', line)
        if match:
            return match.group(1)
    return 'No output generated'


def _report_title(report_type, enum_values, beam_info):
    for e in enum_values:
        if e[0] == report_type:
            return '{}, z={:.4f} cm'.format(e[1], 100 * hellweg_dump_reader.get_parameter(beam_info, 'z'))
    raise RuntimeError('unknown report type: {}'.format(report_type))


def _summary_text(run_dir):
    return pkio.read_text(os.path.join(str(run_dir), HELLWEG_SUMMARY_FILE))
