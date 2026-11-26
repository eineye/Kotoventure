/**
 * Entry routes for regional missions.
 *
 * Most international flights land in Incheon, so a trip to Busan, Gangneung or Gwangju can start
 * three or four ways: fly straight to the regional airport (when it has international flights),
 * or land in Incheon and go on by train, by airport bus or by a domestic flight from Gimpo.
 * Each mission lists the ways that really exist; the player picks one before starting and the
 * arrival and departure scenes (time, cost, the right answer, the KTX ticket machine) follow it.
 * Times and fares are realistic examples – players are told to check before travelling.
 */
import { learn, simulate } from '../dsl';
import { stationById } from '../rail';
import type { ChoiceStep, Course, EntryRoute, EstItem, Gateway, L, SimStep, Step, TimeCat } from '../types';

type Leg = [min: number, fare: number];
type Name = [en: string, ko: string];

interface Rail {
  train: string;
  from: 'seoul' | 'yongsan' | 'cheongnyangni';
  to: Name;
  /** rail.ts station id: the player buys the ticket at the KTX machine (time and fare from the timetable) */
  station?: string;
  min?: number;
  fare?: number;
  /** from the station to the first place */
  local?: Leg;
}
interface Bus {
  to: Name;
  min: number;
  fare: number;
  local?: Leg;
}
interface Air {
  to: Name;
  min: number;
  fare: number;
}
interface Gate {
  /** the regional airport has regular international flights */
  direct: boolean;
  rail?: Rail | null;
  bus?: Bus | null;
  air?: Air | null;
  /** from the city station / terminal to the first place */
  local: Leg;
}

/** by the mission's regional airport */
const GATES: Record<string, Gate> = {
  PUS: { direct: true, rail: { train: 'KTX', from: 'seoul', to: ['Busan', '부산'], station: 'busan' }, bus: { to: ['Busan', '부산'], min: 330, fare: 45000 }, air: { to: ['Gimhae', '김해'], min: 60, fare: 75000 }, local: [30, 1500] },
  TAE: { direct: true, rail: { train: 'KTX', from: 'seoul', to: ['Dongdaegu', '동대구'], station: 'dongdaegu' }, bus: { to: ['Daegu', '대구'], min: 240, fare: 36000 }, local: [20, 1500] },
  CJJ: { direct: true, rail: { train: 'KTX', from: 'seoul', to: ['Osong', '오송'], station: 'osong' }, bus: { to: ['Cheongju', '청주'], min: 150, fare: 24000 }, local: [40, 3000] },
  YNY: { direct: true, rail: { train: 'KTX', from: 'seoul', to: ['Gangneung', '강릉'], station: 'gangneung' }, bus: { to: ['Gangneung', '강릉'], min: 210, fare: 33000 }, local: [25, 1500] },
  // Muan has had no regular international flights since the end of 2024; Yeosu is a domestic airport
  MWX: { direct: false, rail: { train: 'KTX', from: 'yongsan', to: ['Gwangju-Songjeong', '광주송정'], min: 110, fare: 46800 }, bus: { to: ['Gwangju', '광주'], min: 240, fare: 38000 }, local: [30, 1500] },
  RSU: { direct: false, rail: { train: 'KTX', from: 'yongsan', to: ['Yeosu-EXPO', '여수엑스포'], min: 180, fare: 47200 }, air: { to: ['Yeosu', '여수'], min: 60, fare: 70000 }, local: [15, 1500] },
  CJU: { direct: true, air: { to: ['Jeju', '제주'], min: 70, fare: 80000 }, local: [0, 0] },
};

/** missions whose places are further from the main station or reached by another train */
const OVERRIDE: Record<string, { rail?: Partial<Rail> | null; bus?: Partial<Bus> | null; local?: Leg; direct?: Leg }> = {
  'cc-daejeon': { rail: { to: ['Daejeon', '대전'], station: 'daejeon' }, bus: { to: ['Daejeon', '대전'], min: 180, fare: 25000 }, local: [20, 1500] },
  'cc-baekje': { local: [60, 6000], direct: [70, 8000] },
  'cc-danyang': { rail: { train: 'KTX-Eum', from: 'cheongnyangni', to: ['Danyang', '단양'], station: undefined, min: 80, fare: 17000 }, bus: null, local: [15, 1500], direct: [150, 16000] },
  'cc-cheongju': { rail: { local: [35, 2500] }, local: [15, 1500] },
  'cc-boryeong': { rail: { train: 'ITX-Saemaeul', from: 'yongsan', to: ['Daecheon', '대천'], station: undefined, min: 140, fare: 16000 }, bus: null, local: [20, 1500], direct: [150, 15000] },
  'gw-seorak': { direct: [70, 4500], rail: { local: [90, 9000] }, bus: { to: ['Sokcho', '속초'], min: 240, fare: 36000, local: [30, 1500] } },
  'gw-sokcho': { rail: { local: [60, 7000] }, bus: { to: ['Sokcho', '속초'], min: 240, fare: 36000, local: [15, 1500] } },
  'gw-surf': { local: [50, 5000] },
  'jl-boseong': { rail: { local: [100, 10000] }, bus: { local: [90, 9000] } },
  'jl-jirisan': { rail: { to: ['Namwon', '남원'], min: 150, fare: 38000, local: [50, 5000] }, bus: { local: [80, 8000] } },
  'gs-andong': { rail: { train: 'KTX-Eum', from: 'cheongnyangni', to: ['Andong', '안동'], station: undefined, min: 120, fare: 26000, local: [45, 1700] }, bus: null, direct: [150, 14000] },
  'gs-haeinsa': { local: [90, 8000], direct: [110, 9500] },
  'gs-tongyeong': { local: [120, 15000], direct: [120, 15000] },
};

const ICN: Gateway = { kind: 'airport', code: 'ICN', name: { en: 'Incheon International Airport', ko: '인천국제공항' } };
const e = (min: number, cat: TimeCat, en: string, ko: string, cost?: number): EstItem => ({ min, cat, label: { en, ko }, ...(cost ? { cost } : {}) });
const short = (en: string) => en.replace(' International', '');
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const FROM: Record<Rail['from'], { name: Name; to: EstItem[]; back: EstItem[] }> = {
  seoul: { name: ['Seoul', '서울'], to: [e(60, 'move', 'AREX Incheon Airport → Seoul Station', '공항철도 인천공항 → 서울역', 4450)], back: [e(60, 'move', 'AREX Seoul Station → Incheon Airport', '공항철도 서울역 → 인천공항', 4450)] },
  yongsan: {
    name: ['Yongsan', '용산'],
    to: [e(60, 'move', 'AREX Incheon Airport → Seoul Station', '공항철도 인천공항 → 서울역', 4450), e(15, 'move', 'Subway line 1 Seoul Station → Yongsan', '지하철 1호선 서울역 → 용산', 1400)],
    back: [e(15, 'move', 'Subway line 1 Yongsan → Seoul Station', '지하철 1호선 용산 → 서울역', 1400), e(60, 'move', 'AREX Seoul Station → Incheon Airport', '공항철도 서울역 → 인천공항', 4450)],
  },
  cheongnyangni: {
    name: ['Cheongnyangni', '청량리'],
    to: [e(60, 'move', 'AREX Incheon Airport → Seoul Station', '공항철도 인천공항 → 서울역', 4450), e(25, 'move', 'Subway line 1 Seoul Station → Cheongnyangni', '지하철 1호선 서울역 → 청량리', 1400)],
    back: [e(25, 'move', 'Subway line 1 Cheongnyangni → Seoul Station', '지하철 1호선 청량리 → 서울역', 1400), e(60, 'move', 'AREX Seoul Station → Incheon Airport', '공항철도 서울역 → 인천공항', 4450)],
  },
};

const NOTE = {
  direct: { en: 'Fastest – if your airline flies here. Fewer international routes, and tickets can cost more.', ko: '가장 빨라요 – 이 공항으로 오는 국제선이 있을 때만. 노선이 적고 항공권이 비쌀 수 있어요.' },
  rail: { en: 'Most international flights land in Incheon. Trains are fast and comfortable – book seats ahead at weekends.', ko: '대부분의 국제선은 인천에 도착해요. 기차는 빠르고 편해요 – 주말엔 좌석을 미리 예매하세요.' },
  bus: { en: 'No transfers: the bus leaves from the arrivals floor. Cheaper, but slow in traffic.', ko: '환승 없이 도착층에서 바로 출발해요. 저렴하지만 길이 막히면 오래 걸려요.' },
  air: { en: 'Fly on from Gimpo. Short flight, but allow time for the airport transfer and check-in.', ko: '김포에서 국내선으로 갈아타요. 비행은 짧지만 공항 이동과 수속 시간을 넉넉히 잡으세요.' },
};

export interface RouteInput {
  missionId: string;
  hub: string;
  hubName: L & { ko: string };
  hubBg: string;
  /** first place of the trip */
  first: Name;
  /** how to get from the regional airport to the first place */
  go: string;
  /** minutes and fare from the regional airport to the first place */
  direct: Leg;
  /** the trip ends at the same airport (the departure follows the route too) */
  roundTrip: boolean;
}

/** The ways to reach a regional mission; empty for missions that start in Seoul or at a port. */
export function routesFor(x: RouteInput): EntryRoute[] {
  const base = GATES[x.hub];
  if (!base) return [];
  const ov = OVERRIDE[x.missionId] ?? {};
  const rail = ov.rail === null || !base.rail ? null : { ...base.rail, ...(ov.rail ?? {}) };
  const bus = ov.bus === null || !base.bus ? null : { ...base.bus, ...(ov.bus ?? {}) };
  const air = base.air ?? null;
  const local = ov.local ?? base.local;
  const direct = ov.direct ?? x.direct;
  const hubGw: Gateway = { kind: 'airport', code: x.hub, name: x.hubName };
  const hubShort = short(x.hubName.en);
  const toFirst = (l: Leg) => (l[0] > 0 ? [e(l[0], 'move', `Local transport to ${x.first[0]}`, `${x.first[1]}까지 이동`, l[1])] : []);
  const fromFirst = (l: Leg, where: Name) => (l[0] > 0 ? [e(l[0], 'move', `Local transport to ${where[0]}`, `${where[1]}까지 이동`, l[1])] : []);
  const directLeg = e(direct[0], 'move', x.go, `${x.first[1]}까지 이동`, direct[1]);
  const directBack = e(direct[0], 'move', `Back to ${x.hubName.en}`, `${x.hubName.ko}까지 이동`, direct[1]);
  const out: EntryRoute[] = [];

  if (base.direct)
    out.push({
      id: 'direct', icon: '✈️', label: { en: `Fly direct to ${hubShort}`, ko: `${x.hubName.ko} 직항` }, note: NOTE.direct,
      via: hubGw, bg: x.hubBg, go: { en: x.go }, legs: [directLeg],
      ...(x.roundTrip ? { back: [directBack] } : {}), station: x.hubName, min: 0, cost: 0, extra: 0,
    });

  if (rail) {
    const f = FROM[rail.from];
    const st = rail.station ? stationById(rail.station) : undefined;
    const min = st?.min ?? rail.min ?? 120;
    const fare = st?.fare ?? rail.fare ?? 30000;
    const loc = rail.local ?? local;
    const startMin = 10 * 60 + 50 + f.to.reduce((a, it) => a + it.min, 0);
    const arriveBy = hm(Math.ceil((startMin + 20 + min + 60) / 30) * 30);
    const ride = e(min, 'move', `${rail.train} ${f.name[0]} → ${rail.to[0]}`, `${rail.train} ${f.name[1]} → ${rail.to[1]}`, fare);
    const steps: Step[] = [learn('tr-arex')];
    if (st)
      steps.push(
        simulate('train', 'transport', 'KTX map & ticket machine', `At ${f.name[0]} Station, find ${rail.to[0]} on the KTX map and buy tickets for your whole party. Try to arrive by ${arriveBy}.`, { from: rail.from, to: rail.station, arriveBy }, 'tr-ktx'),
      );
    else steps.push(learn('tr-ktx'));
    out.push({
      id: 'icn-rail', icon: '🚄', label: { en: `Incheon + ${rail.train}`, ko: `인천 + ${rail.train}` }, note: NOTE.rail, via: ICN, bg: 'airport',
      go: {
        en: rail.from === 'seoul' ? `AREX to Seoul Station, then ${rail.train} to ${rail.to[0]}` : `AREX and subway to ${f.name[0]}, then ${rail.train} to ${rail.to[0]}`,
        ko: rail.from === 'seoul' ? `공항철도로 서울역 → ${rail.train}로 ${rail.to[1]}` : `공항철도·지하철로 ${f.name[1]}역 → ${rail.train}로 ${rail.to[1]}`,
      },
      // with the ticket machine the simulation adds the ride (time and fare from the timetable)
      legs: [...f.to, ...(st ? [] : [e(20, 'task', 'Buy a train ticket & find the platform', '승차권 구매·승강장 찾기'), ride]), ...toFirst(loc)],
      steps,
      ...(x.roundTrip ? { back: [...fromFirst(loc, [`${rail.to[0]} Station`, `${rail.to[1]}역`]), e(min, 'move', `${rail.train} ${rail.to[0]} → ${f.name[0]}`, `${rail.train} ${rail.to[1]} → ${f.name[1]}`, fare), ...f.back] } : {}),
      station: { en: `${rail.to[0]} Station`, ko: `${rail.to[1]}역` }, min: 0, cost: 0, extra: 0,
    });
  }

  if (bus) {
    const loc = bus.local ?? local;
    out.push({
      id: 'icn-bus', icon: '🚌', label: { en: 'Incheon + airport bus', ko: '인천 + 공항버스' }, note: NOTE.bus, via: ICN, bg: 'airport',
      go: { en: `Airport limousine bus from Incheon straight to ${bus.to[0]}`, ko: `인천공항에서 ${bus.to[1]}행 공항버스` },
      legs: [e(15, 'task', 'Buy an airport-bus ticket (arrivals floor)', '공항버스 승차권 구매(도착층)'), e(bus.min, 'move', `Airport bus Incheon → ${bus.to[0]}`, `공항버스 인천공항 → ${bus.to[1]}`, bus.fare), ...toFirst(loc)],
      ...(x.roundTrip ? { back: [...fromFirst(loc, [`${bus.to[0]} bus terminal`, `${bus.to[1]} 버스터미널`]), e(bus.min, 'move', `Airport bus ${bus.to[0]} → Incheon`, `공항버스 ${bus.to[1]} → 인천공항`, bus.fare)] } : {}),
      station: { en: `${bus.to[0]} bus terminal`, ko: `${bus.to[1]} 버스터미널` }, min: 0, cost: 0, extra: 0,
    });
  }

  if (air) {
    const gmpTo = e(35, 'move', 'AREX Incheon Airport → Gimpo Airport', '공항철도 인천공항 → 김포공항', 4150);
    const gmpBack = e(35, 'move', 'AREX Gimpo Airport → Incheon Airport', '공항철도 김포공항 → 인천공항', 4150);
    const checkin = e(60, 'task', 'Domestic check-in & security', '국내선 체크인·보안검색');
    out.push({
      id: 'icn-air', icon: '🛫', label: { en: 'Incheon → Gimpo + domestic flight', ko: '인천 → 김포 + 국내선' }, note: NOTE.air, via: ICN, bg: 'airport',
      go: { en: `AREX to Gimpo, then a domestic flight to ${air.to[0]}`, ko: `공항철도로 김포공항 → 국내선으로 ${air.to[1]}` },
      legs: [gmpTo, checkin, e(air.min, 'move', `Domestic flight Gimpo → ${air.to[0]}`, `국내선 김포 → ${air.to[1]}`, air.fare), directLeg],
      steps: [learn('tr-arex')], min: 0, cost: 0, extra: 0,
      ...(x.roundTrip ? { back: [directBack, checkin, e(air.min, 'move', `Domestic flight ${air.to[0]} → Gimpo`, `국내선 ${air.to[1]} → 김포`, air.fare), gmpBack] } : {}),
      station: x.hubName,
    });
  }
  // time and cost of each way in; the starting budget covers the extra fares
  const sum = (it: EstItem[], k: 'min' | 'cost') => it.reduce((a, i) => a + (i[k] ?? 0), 0);
  const directCost = direct[1] * (x.roundTrip ? 2 : 1);
  for (const r of out) {
    const sim = r.steps?.find((s): s is SimStep => s.type === 'sim' && s.sim === 'train');
    const st = sim ? stationById(sim.config?.to ?? '') : undefined;
    r.min = sum(r.legs, 'min') + (st?.min ? st.min + 20 : 0);
    r.cost = sum(r.legs, 'cost') + (st?.fare ?? 0);
    r.extra = Math.max(0, Math.round((r.cost + sum(r.back ?? [], 'cost') - directCost) / 1000) * 1000);
  }
  return out.length > 1 || (out.length === 1 && out[0].id !== 'direct') ? out : [];
}

/**
 * The mission arriving (and, for round trips, leaving) by the chosen route: the first and last
 * scenes get the route's time, costs, answer and steps. The version changes with the route, so a
 * run in progress restarts instead of resuming with a different timeline.
 */
export function withEntryRoute(course: Course, id: string | undefined): Course {
  const routes = course.routes;
  const idx = routes && id ? routes.findIndex((r) => r.id === id) : -1;
  if (!routes || idx < 0) return course;
  const r = routes[idx];
  const scenes = course.scenes.slice();

  // arrival
  const s0 = scenes[0];
  const imm = s0.est?.items?.[0];
  const steps = s0.steps.filter((x) => !x.fromRoute);
  const ti = steps.findIndex((x) => x.type === 'choice' && x.topic === 'transport');
  if (ti >= 0) {
    const ch = steps[ti] as ChoiceStep;
    const ci = ch.options.findIndex((o) => o.correct);
    steps[ti] = { ...ch, options: ch.options.map((o, k) => (k === ci ? { ...o, text: r.go } : o)) };
    if (r.steps?.length) steps.splice(ti + 1, 0, ...r.steps.map((x) => ({ ...x, fromRoute: true })));
  }
  scenes[0] = {
    ...s0, bg: r.bg, title: { en: `Arrive at ${short(r.via.name.en)}`, ko: `${r.via.name.ko} 도착` }, location: r.via.name,
    est: { ...(s0.est ?? {}), items: [...(imm ? [imm] : []), ...r.legs] }, steps,
  };

  // departure (round trips)
  let exit = course.exit;
  if (r.back && scenes.length > 1) {
    const z = scenes.length - 1;
    const sz = scenes[z];
    const items = sz.est?.items ?? [];
    const checkin = items[items.length - 1];
    const time = /^\d\d:\d\d · /.test(sz.title.en) ? sz.title.en.slice(0, 8) : '';
    const name = r.station ?? r.via.name;
    scenes[z] = {
      ...sz, bg: r.bg, title: { en: `${time}Back to ${short(r.via.name.en)}`, ko: `${time}${r.via.name.ko} 귀국` }, location: r.via.name,
      est: { ...(sz.est ?? {}), items: [...r.back, ...(checkin ? [checkin] : [])] },
      steps: sz.steps.map((x, k) => {
        if (k === 0 && x.type === 'narration') return { ...x, text: { en: `Day ${sz.day}. Time to head back to ${r.via.name.en}.`, ko: `${sz.day}일차. 이제 ${r.via.name.ko}으로 돌아갈 시간이에요.` } };
        if (x.type === 'sim' && x.sim === 'taxi') return { ...x, config: { ...(x as SimStep).config, dest: `${name.ko} ${name.en}`, addr: name.ko ?? name.en } } as Step;
        return x;
      }),
    };
    exit = r.via;
  }
  // the budget was set for the default way in (routes[0], already built in)
  const startBudget = course.startBudget - routes[0].extra + r.extra;
  return { ...course, entry: r.via, exit, scenes, startBudget, version: course.version + idx / 1000 };
}
