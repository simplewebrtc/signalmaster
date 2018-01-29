'use strict';


const internals = {};


internals.TIME_BANDS = {
  blips: ['0', '5s'],
  under_30_seconds: ['5s', '30s'],
  under_1_minute: ['30s', '1min'],
  under_5_minutes: ['1min', '5min'],
  under_10_minutes: ['5min', '10min'],
  under_20_minutes: ['10min', '20min'],
  under_30_minutes: ['20min', '30min'],
  under_45_minutes: ['30min', '45min'],
  under_1_hour: ['45min', '1hr'],
  under_2_hours: ['1hr', '2hr'],
  under_4_hours: ['2hr', '4hr'],
  under_8_hours: ['4hr', '8hr'],
  under_12_hours: ['8hr', '12hr'],
  under_1_day: ['12hr', '1day'],
  over_1_day: ['1day', '1week']
};

internals.BANDS = {
  duration: [
    ['blips', '5 seconds'],
    ['under_30_seconds', '30 seconds'],
    ['under_1_minute', '1 minute'],
    ['under_5_minutes', '5 minutes'],
    ['under_10_minutes', '10 minutes'],
    ['under_20_minutes', '20 minutes'],
    ['under_30_minutes', '30 minutes'],
    ['under_45_minutes', '45 minutes'],
    ['under_1_hour', '1 hour'],
    ['under_2_hours', '2 hours'],
    ['under_4_hours', '4 hours'],
    ['under_8_hours', '8 hours'],
    ['under_12_hours', '12 hours'],
    ['under_1_day', '1 day'],
    ['over_1_day', 'Over 1 day']
  ],
  occupants: [
    ['equal_1', '1'],
    ['equal_2', '2'],
    ['equal_3', '3'],
    ['equal_4', '4'],
    ['equal_5', '5'],
    ['equal_6', '6'],
    ['equal_7', '7'],
    ['equal_8', '8'],
    ['equal_9', '9'],
    ['equal_10', '10'],
    ['over_10', 'Over 10']
  ]
};


internals.getTimeBandMin = (band) => {

  return (internals.TIME_BANDS[band] || [])[0] || null;
};

internals.getTimeBandMax = (band) => {

  return (internals.TIME_BANDS[band] || [])[1] || null;
};



module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const { histogram_type } = request.params;
    const { time_band, occupant_count } = request.query;

    const dayHistogram = {};
    const weekHistogram = {};

    if (histogram_type === 'duration') {
      const durationDayHistogramBands = await this.db.rooms.duration_histogram({
        ts: new Date(),
        interval: '1day',
        occupant_count: occupant_count || null
      });
      for (const band of durationDayHistogramBands) {
        dayHistogram[band.case] = band.count;
      }

      const durationWeekHistogramBands = await this.db.rooms.duration_histogram({
        ts: new Date(),
        interval: '7days',
        occupant_count: occupant_count || null
      });
      for (const band of durationWeekHistogramBands) {
        weekHistogram[band.case] = band.count;
      }
    }

    if (histogram_type === 'occupants') {
      const occupantsDayHistogramBands = await this.db.rooms.occupants_histogram({
        ts: new Date(),
        interval: '1day',
        duration_min: internals.getTimeBandMin(time_band),
        duration_max: internals.getTimeBandMax(time_band)
      });
      for (const band of occupantsDayHistogramBands) {
        dayHistogram[band.case] = band.count;
      }

      const occupantsWeekHistogramBands = await this.db.rooms.occupants_histogram({
        ts: new Date(),
        interval: '7days',
        duration_min: internals.getTimeBandMin(time_band),
        duration_max: internals.getTimeBandMax(time_band)
      });
      for (const band of occupantsWeekHistogramBands) {
        weekHistogram[band.case] = band.count;
      }
    }

    return h.view('histograms', {
      histogramType: histogram_type,
      histogramBands: internals.BANDS[histogram_type],
      dayHistogram,
      weekHistogram
    });
  }
};

