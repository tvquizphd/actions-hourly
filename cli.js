const toInt = x => parseInt(x, 10);

const to_range = (m, h1, h2, day) => {
  const min_start = (h1 + 24*day) * 60 + m;
  const min_stop = (h2 + 24*day) * 60 + m;
  return { min_start, min_stop };
}

const _cron = (m, f, h, end, day) => {
  const pre = '- cron:'
  if (end - h < f.h) {
    const text = `${pre} ${m} ${h} * * *`;
    return {text, ...to_range(m, h, h, day)};
  }
  const e = h + Math.floor((end-h)/f.h)*f.h;
  const text = `${pre} ${m} ${h}-${e}/${f.h} * * *`;
  return {text, ...to_range(m, h, e, day)};
}
const cron = (start, end, f, min) => {
  var date = new Date(0);
  date.setMinutes(min);
  const add24 = (a, b) => (24 + a + b) % 24;
  const s = date.toISOString().substring(11, 16);
  const [ h, m ] = s.split(':').map(toInt);
  const _ran = [...new Array(24).keys()];
  const start_full = add24(h, start);
  const end_full = add24(end, - 1);
  const start_small = _ran.reduce((o) => {
    if (o < start) return o;
    return add24(o, f.h);
  }, start_full);
  const end_max = 23;
  const o = {
    early: _cron(m, f, start_small, end, 1),
    full: _cron(m, f, start_full, end_full, 0),
    late: _cron(m, f, start_full, end_max, 0)
  }
  switch (Math.sign(end - start)) {
    case 1:
      delete o.late;
      delete o.early;
      if (h+start >= end) delete o.full;
      break;
    case -1:
      if (end_max <= h+start) delete o.late;
      if (start_small > end) delete o.early;
      delete o.full;
      break;
    default:
      return [_cron(m, f, h, end_max)];
  }
  return Object.values(o); 
}

const find = (h, dt) => {
  const reps = h+1;
  const mod = (reps*dt)%(h*60);
  if (mod !== 0) return null;
  return {h, reps, dt};
}

const show = m => {
  const d = new Date(0);
  d.setUTCMinutes(m);
  const iso = d.toISOString();
  return iso.substring(11, 16);
}

const to_utc_precise = (patterns) => {
  if (patterns.length === 0) {
    return 'never'
  }
  const crons_t0 = [...patterns].sort((a, b) => {
    return a.min_start - b.min_start;
  });
  const crons_t1 = [...patterns].sort((a, b) => {
    return b.min_stop - a.min_stop;
  });
  const t0 = crons_t0[0].min_start;
  const t1 = crons_t1[0].min_stop;
  const utc = `${show(t0)} ≤ (UTC) ≤ ${show(t1)}`;
  const crons = crons_t0.map(({text}) => text);
  return { utc, crons };
}

const rep_crons = (wake, sleep, tz, dt) => {
  const min_off = Math.ceil(Math.random()*(59-dt));
  const start = (new Date('0 '+wake)).getUTCHours();
  const end = (new Date('0 '+sleep)).getUTCHours();
  const output = [];
  for (let h = 2; h < 6; h++) {
    const found = find(h, dt);
    if (!found) continue;
    const steps = [...new Array(found.reps - 1).keys()];
    const times = steps.reduce(times => {
      const last = times[times.length - 1];
      return times.concat([last + dt]);
    }, [min_off]);
    const patterns = times.reduce((p, t, i) => {
      const patterns = cron(start, end, found, t);
      return p.concat(patterns);
    }, []);
    const { utc, crons } = to_utc_precise(patterns);
    const [w, s] = [wake, sleep].map(x => x.replace(':',''));
    const offset = `After ${min_off} minute offset`;
    const header = `Every ${dt} minutes, ${offset}`;
    const local = `${w} < (${tz}) < ${s}`
    const crons_list = crons.map(t => t.slice(8))
    const crons_yaml = crons.join('\n');
    const out = JSON.stringify({
      crons_yaml, crons_list, header, local, utc
    }, null, 4);
    output.push(out);
  }
  return output;
}

const to_input = (dt, ...args) => {
  const fmt = Intl.DateTimeFormat();
  const node_tz = fmt.resolvedOptions().timeZone;
  const tz = process.env.TZ || node_tz;
  const tzv = Intl.supportedValuesOf('timeZone');
  const ok = ['45','48','50'];
  if (!tzv.includes(tz)) {
    console.error(`Bad timezone: "${tz}"`);
    process.exit(1);
  }
  if (!dt) {
    console.error(`Provide period in [${ok.join(', ')}].`);
    process.exit(1);
  }
  if (isNaN(toInt(dt)) || !ok.includes(dt)) {
    console.error(`Valid periods: [${ok.join(',')}], not "${dt}"`);
    process.exit(1);
  }
  const a = args.map(a => {
    return a.replace(/(\d+)/, '$1:');
  })
  const bad_arg = a.find(time => {
    const [min, suffix] = time.split(':');
    if (!suffix) return true;
    if (isNaN(toInt(min))) return true;
    if (min < 0 || min > 12) return true;
    return !['AM','PM'].includes(suffix);
  });
  if (bad_arg) {
    console.error(`Bad time format: "${bad_arg}"`);
    process.exit(1);
  }
  const [wake, sleep] = a;
  const w = wake || '6:AM';
  const s = sleep || '11:PM';
  return [w, s, tz, toInt(dt)];
}

const cli = () => {
  const args = process.argv.slice(2);
  const input = (()=>{
    try {
      return to_input(...args);
    }
    catch (e) {
      console.error(e);
      process.exit(1)
    }
  })();
  const outputs = rep_crons(...input);
  const output = outputs.find(x => x);
  console.log(output)
}
cli();
