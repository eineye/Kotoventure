import type { SimProps } from './kit';
import { ExchangeSim } from './ExchangeSim';
import { AtmSim } from './AtmSim';
import { TmoneySim } from './TmoneySim';
import { TrainSim } from './TrainSim';
import { CashPaySim } from './CashPay';
import { DayPlanSim } from './DayPlanSim';
import { TransferSim } from './TransferSim';
import { KioskSim } from './KioskSim';
import { PhraseSim } from './PhraseSim';

/** Picks the simulation component for a sim step. */
export function SimRunner(props: SimProps) {
  switch (props.step.sim) {
    case 'exchange':
      return <ExchangeSim {...props} />;
    case 'atm':
      return <AtmSim {...props} />;
    case 'tmoney':
      return <TmoneySim {...props} />;
    case 'train':
      return <TrainSim {...props} />;
    case 'cashpay':
      return <CashPaySim {...props} />;
    case 'dayplan':
      return <DayPlanSim {...props} />;
    case 'transfer':
      return <TransferSim {...props} />;
    case 'kiosk':
      return <KioskSim {...props} />;
    case 'phrase':
      return <PhraseSim {...props} />;
    default:
      return null;
  }
}

export const SIM_ICON: Record<string, string> = { exchange: '💱', atm: '🏧', tmoney: '🟧', train: '🚄', cashpay: '💵', dayplan: '🗓️', transfer: '🚇', kiosk: '🖥️', phrase: '🗣️' };
