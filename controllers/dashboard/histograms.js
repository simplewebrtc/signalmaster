'use strict';

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const durationDayHistogramBands = await this.db.rooms.duration_histogram({
      ts: new Date(),
      interval: '1day',
      occupant_count: null
    });
    const durationDayHistogram = {};
    for (const band of durationDayHistogramBands) {
      durationDayHistogram[band.case] = band.count;
    }

    const durationWeekHistogramBands = await this.db.rooms.duration_histogram({
      ts: new Date(),
      interval: '7days',
      occupant_count: null
    });
    const durationWeekHistogram = {};
    for (const band of durationWeekHistogramBands) {
      durationWeekHistogram[band.case] = band.count;
    }

    const occupantsDayHistogramBands = await this.db.rooms.occupants_histogram({
      ts: new Date(),
      interval: '1day',
      duration_min: null,
      duration_max: null
    });
    const occupantsDayHistogram = {};
    for (const band of occupantsDayHistogramBands) {
      occupantsDayHistogram[band.case] = band.count;
    }

    const occupantsWeekHistogramBands = await this.db.rooms.occupants_histogram({
      ts: new Date(),
      interval: '7days',
      duration_min: null,
      duration_max: null
    });
    const occupantsWeekHistogram = {};
    for (const band of occupantsWeekHistogramBands) {
      occupantsWeekHistogram[band.case] = band.count;
    }

    const singleOccupantDurationDayHistogramBands = await this.db.rooms.duration_histogram({
      ts: new Date(),
      interval: '1day',
      occupant_count: '1'
    });
    const singleOccupantDurationDayHistogram = {};
    for (const band of singleOccupantDurationDayHistogramBands) {
      singleOccupantDurationDayHistogram[band.case] = band.count;
    }

    const singleOccupantDurationWeekHistogramBands = await this.db.rooms.duration_histogram({
      ts: new Date(),
      interval: '7days',
      occupant_count: '1'
    });
    const singleOccupantDurationWeekHistogram = {};
    for (const band of singleOccupantDurationWeekHistogramBands) {
      singleOccupantDurationWeekHistogram[band.case] = band.count;
    }

    return h.view('histograms', {
      durationDayHistogram,
      durationWeekHistogram,
      occupantsDayHistogram,
      occupantsWeekHistogram,
      singleOccupantDurationDayHistogram,
      singleOccupantDurationWeekHistogram
    });
  }
};
