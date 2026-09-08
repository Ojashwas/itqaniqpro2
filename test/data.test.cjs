const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Data = require('../data.js');

// Read the actual prototype seed without evaluating browser code or retaining state.
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const seedStart = source.indexOf('const initialKpis=');
assert.ok(seedStart >= 0, 'app.js declares its synthetic KPI seed');
const seedOpen = source.indexOf('[', seedStart);
let depth = 0;
let seedEnd = -1;
let quote = null;
let escaped = false;
for (let i = seedOpen; i < source.length; i++) {
  const character = source[i];
  if (quote) {
    if (escaped) escaped = false;
    else if (character === '\\') escaped = true;
    else if (character === quote) quote = null;
    continue;
  }
  if (character === "'" || character === '"' || character === '`') quote = character;
  else if (character === '[') depth++;
  else if (character === ']' && --depth === 0) { seedEnd = i + 1; break; }
}
assert.ok(seedEnd > seedOpen, 'the synthetic KPI array is complete');
const rawSeed = JSON.parse(JSON.stringify(vm.runInNewContext(source.slice(seedOpen, seedEnd))));
const freshSeed = () => Data.normalise(structuredClone(rawSeed));
const approximate = (actual, expected) => assert.ok(
  Math.abs(actual - expected) < 1e-10,
  `expected ${expected}, received ${actual}`,
);
const measure = (overrides = {}) => ({
  id: 'KPI-TEST-001', name: 'Test measure', goal: 0, dept: 'Test department',
  direction: 'higher', unit: '%', target: 90, amber: 80, actual: 85,
  prior: 84, history: [80, 81, 82, 83, 84, 85],
  confidences: Array(6).fill('Validated'), ...overrides,
});

test('seed totals reconcile for August and September', () => {
  for (const month of [4, 5]) {
    const current = Data.published(freshSeed(), 'All departments', month);
    assert.deepEqual(Data.summary(current), {
      total: 8, green: 4, amber: 3, red: 1, missing: 0,
      measured: 8, attention: 4, departments: 4, goals: 4,
    });
    assert.equal(current.filter(k => Data.status(k) === 'green').length / current.length, 0.5);
  }
});

test('seed achievement uses unrounded ratios and the correct historical period', () => {
  const expectedOverall = [90.13273475074601, 92.15232963726093, 93.66555350299026,
    94.93460164927721, 95.21625186573641, 95.80913714560207];
  const seed = freshSeed();
  Data.trajectory(seed, 'All departments', 5).forEach((result, i) => approximate(result, expectedOverall[i]));
  assert.equal(Data.trajectory(seed, 'All departments', 4).length, 5);
  const expectedGoals = {
    4: [99.48453608247422, 87.03703703703704, 95.45454545454547, 98.88888888888889],
    5: [99.69072164948454, 85.71428571428572, 98.38709677419354, 99.44444444444444],
  };
  for (const month of [4, 5]) {
    const current = Data.published(seed, 'All departments', month);
    approximate(Data.overall(current), expectedOverall[month]);
    expectedGoals[month].forEach((expected, goal) => approximate(Data.avg(current.filter(k => k.goal === goal)), expected));
  }
  assert.equal(Math.round(Data.avg(Data.published(seed).filter(k => k.goal === 3))), 99);
});

test('department scopes, drafts, and publication dates reconcile with totals', () => {
  const seed = freshSeed();
  const publicSafety = Data.published(seed, 'Public Safety', 5);
  assert.equal(publicSafety.length, 2);
  assert.deepEqual(Data.summary(publicSafety), {
    total: 2, green: 1, amber: 1, red: 0, missing: 0,
    measured: 2, attention: 1, departments: 1, goals: 1,
  });
  const withNew = [...seed, measure({ id: 'KPI-NEW-009', createdIndex: 5 }), measure({ id: 'KPI-NEW-010', draft: true })];
  assert.equal(Data.published(withNew, 'All departments', 4).length, 8);
  assert.equal(Data.published(withNew, 'All departments', 5).length, 9);
  assert.equal(Data.published(seed, 'Unknown department').length, 0);
});

test('status uses exact higher-is-better and lower-is-better boundaries', () => {
  for (const [actual, expected] of [[100, 'green'], [90, 'green'], [89.99, 'amber'], [80, 'amber'], [79.99, 'red'], [0, 'red']]) {
    assert.equal(Data.status(measure({ actual })), expected);
  }
  for (const [actual, expected] of [[0, 'green'], [2, 'green'], [2.01, 'amber'], [2.4, 'amber'], [2.41, 'red']]) {
    assert.equal(Data.status(measure({ direction: 'lower', unit: 'days', target: 2, amber: 2.4, actual })), expected);
  }
  assert.equal(Data.aggregateStatus(95), 'green');
  assert.equal(Data.aggregateStatus(94.99), 'amber');
  assert.equal(Data.aggregateStatus(85), 'amber');
  assert.equal(Data.aggregateStatus(84.99), 'red');
  assert.equal(Data.aggregateStatus(null), 'missing');
});

test('zero actuals are valid, achievement is capped, and invalid observations are missing', () => {
  assert.equal(Data.score(measure({ actual: 0 })), 0);
  assert.equal(Data.score(measure({ direction: 'lower', actual: 0 })), 100);
  assert.equal(Data.score(measure({ actual: 100 })), 100);
  assert.equal(Data.score(measure({ direction: 'lower', unit: 'days', target: 2, actual: 1 })), 100);
  approximate(Data.score(measure({ direction: 'lower', unit: 'days', target: 2, actual: 2.8 })), 71.42857142857143);
  for (const actual of [null, undefined, NaN, Infinity, -Infinity, -1, '85', 101]) {
    const kpi = measure({ actual });
    assert.equal(Data.status(kpi), 'missing', `invalid actual ${String(actual)}`);
    assert.equal(Data.score(kpi), null);
  }
  assert.equal(Data.validActual(measure({ unit: 'count' }), 2.5), false);
  assert.equal(Data.validActual(measure({ unit: 'count' }), 0), true);
});

test('missing-data counts remain visible and empty achievement is null', () => {
  const observations = [measure({ actual: 100 }), measure({ actual: 85 }), measure({ actual: 70 }), measure({ actual: null })];
  const summary = Data.summary(observations);
  assert.equal(summary.green + summary.amber + summary.red + summary.missing, summary.total);
  assert.equal(summary.measured + summary.missing, summary.total);
  assert.equal(summary.attention, 3);
  assert.equal(summary.missing, 1);
  assert.equal(Data.avg([]), null);
  assert.equal(Data.overall([]), null);
  assert.equal(Data.avg([measure({ actual: null })]), null);
  assert.equal(Data.overall([measure({ actual: null })]), null);
  assert.equal(Data.mean([null, undefined, NaN, Infinity]), null);
});

test('equal objective weights sum to 100 including objectives with three KPIs', () => {
  assert.deepEqual(Data.weights([]), {});
  assert.deepEqual(Data.weights([{ id: 'one' }]), { one: 100 });
  assert.deepEqual(Data.weights([{ id: 'one' }, { id: 'two' }]), { one: 50, two: 50 });
  assert.deepEqual(Data.weights([{ id: 'one' }, { id: 'two' }, { id: 'three' }]), { one: 33.34, two: 33.33, three: 33.33 });
  for (const count of [3, 6, 7, 9, 13]) {
    const values = Object.values(Data.weights(Array.from({ length: count }, (_, i) => ({ id: `k-${i}` }))));
    approximate(values.reduce((sum, value) => sum + value, 0), 100);
    assert.ok(Math.max(...values) - Math.min(...values) <= 0.01000000001);
  }
  const unevenGoals = [measure({ goal: 0, actual: 100 }), measure({ goal: 0, actual: 100 }),
    measure({ goal: 0, actual: 100 }), measure({ goal: 1, actual: 0 })];
  assert.equal(Data.overall(unevenGoals), 50, 'adding a KPI does not increase its parent goal weight');
});

test('trend compares the immediately preceding reporting month', () => {
  const seed = freshSeed();
  const kpi = seed.find(k => k.id === 'KPI-SRV-002');
  assert.equal(Data.at(kpi, 5).prior, 2.7);
  assert.equal(Data.at(kpi, 4).prior, 2.6);
  assert.equal(Data.trend(Data.at(kpi, 5)), 'deteriorating');
  assert.equal(Data.trend(Data.at(seed.find(k => k.id === 'KPI-SEC-001'), 5)), 'improving');
  assert.equal(Data.trend(Data.at(seed.find(k => k.id === 'KPI-TRF-002'), 4)), 'stable');
  assert.equal(Data.trend(measure({ prior: null })), 'unavailable');
  assert.equal(Data.trend(Data.at(kpi, 0)), 'unavailable');
});

test('forecasts respect units and require a prior observation', () => {
  assert.equal(Data.forecast(measure({ actual: 99, prior: 90 })), 100);
  assert.equal(Data.forecast(measure({ actual: 5, prior: 15 })), 0);
  assert.equal(Data.forecast(measure({ actual: 85, prior: 84 })), 86);
  assert.equal(Data.forecast(measure({ unit: 'count', actual: 11, prior: 8 })), 14);
  assert.equal(Data.forecast(measure({ actual: null })), null);
  assert.equal(Data.forecast(measure({ prior: null })), null);
});

test('new KPI normalization removes fabricated historical observations', () => {
  const draft = Data.normalise([measure({ id: 'KPI-NEW-009', draft: true, history: Array(6).fill(85) })])[0];
  assert.deepEqual(draft.history, Array(6).fill(null));
  assert.equal(draft.actual, null);
  assert.equal(draft.prior, null);
  assert.equal(draft.baseline, 85);
  assert.equal(draft.createdIndex, 5);
  assert.equal(Data.recoveryReady(draft), false);
  const published = Data.normalise([measure({ id: 'KPI-NEW-010', history: Array(6).fill(100) })])[0];
  assert.deepEqual(published.history, [null, null, null, null, null, 100]);
  assert.equal(Data.published([published], 'All departments', 4).length, 0);
  assert.equal(Data.recoveryReady(published), false);
  assert.equal(Data.forecast(Data.at(published)), null);
});

test('revising an actual retains the true prior period and confidence', () => {
  const kpi = freshSeed().find(k => k.id === 'KPI-SRV-002');
  const august = kpi.history[4];
  Data.recordActual(kpi, 5, 2.2, 'Provisional');
  assert.equal(kpi.actual, 2.2);
  assert.equal(kpi.prior, august);
  assert.equal(kpi.history[5], 2.2);
  assert.equal(Data.at(kpi, 5).confidence, 'Provisional');
  Data.recordActual(kpi, 5, 2.1, 'Estimated');
  assert.equal(kpi.prior, august, 'same-month edits do not replace the previous month');
  assert.equal(Data.at(kpi, 5).confidence, 'Estimated');
  assert.equal(kpi.history[4], august);
  assert.equal(Data.trend(Data.at(kpi, 5)), 'improving');
});

test('invalid records cannot alter stored history', () => {
  for (const value of [NaN, Infinity, -Infinity, -1, null, undefined, '12', 101]) {
    const kpi = measure();
    const before = structuredClone(kpi);
    assert.throws(() => Data.recordActual(kpi, 5, value, 'Validated'));
    assert.deepEqual(kpi, before);
  }
  assert.throws(() => Data.recordActual(measure({ unit: 'count' }), 5, 1.5, 'Validated'));
  assert.throws(() => Data.recordActual(measure(), 4, 90, 'Validated'), /Historical/);
  assert.throws(() => Data.recordActual(measure({ draft: true }), 5, 90, 'Validated'), /Approve/);
  assert.throws(() => Data.recordActual(measure(), 5, 90, 'Unknown'), /confidence/);
  const zero = measure();
  Data.recordActual(zero, 5, 0, 'Validated');
  assert.equal(zero.actual, 0);
  assert.equal(Data.status(zero), 'red');
});

test('recovery requires two consecutive observed green months', () => {
  const seed = freshSeed();
  assert.equal(Data.recoveryReady(seed.find(k => k.id === 'KPI-SRV-001')), true);
  const service = seed.find(k => k.id === 'KPI-SRV-002');
  assert.equal(Data.recoveryReady(service), false);
  Data.recordActual(service, 5, 2, 'Validated');
  assert.equal(Data.recoveryReady(service), false, 'a green September cannot erase a red August');
  const kpi = measure({ history: [null, null, null, null, 90, 95] });
  assert.equal(Data.recoveryReady(kpi), true);
  kpi.history[4] = null;
  assert.equal(Data.recoveryReady(kpi), false);
  kpi.history[4] = 89;
  assert.equal(Data.recoveryReady(kpi), false);
});

test('definition validation rejects inconsistent thresholds and invalid units', () => {
  const definition = { ...measure(), baseline: 0, owner: 'Owner', source: 'Synthetic source',
    definition: 'Test definition', formula: 'Reported value', type: 'Leading', frequency: 'Monthly' };
  assert.doesNotThrow(() => Data.validateDefinition(definition, [{}]));
  for (const overrides of [{ name: ' ' }, { goal: 1 }, { target: 0 }, { target: NaN },
    { baseline: 101 }, { amber: 90 }, { direction: 'sideways' }, { unit: 'unknown' },
    { frequency: 'Quarterly' }, { type: 'unknown' }, { unit: 'count', baseline: 1.5 }]) {
    assert.throws(() => Data.validateDefinition({ ...definition, ...overrides }, [{}]));
  }
  assert.doesNotThrow(() => Data.validateDefinition({ ...definition, direction: 'lower', unit: 'days', target: 2, amber: 2.4 }, [{}]));
  assert.throws(() => Data.validateDefinition({ ...definition, direction: 'lower', unit: 'days', target: 2, amber: 1 }, [{}]));
});
