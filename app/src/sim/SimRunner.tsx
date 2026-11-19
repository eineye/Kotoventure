import type { SimProps } from './kit';
import { ExchangeSim } from './ExchangeSim';
import { AtmSim } from './AtmSim';
import { TmoneySim } from './TmoneySim';
import { TrainSim } from './TrainSim';

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
    default:
      return null;
  }
}

export const SIM_ICON: Record<string, string> = { exchange: '💱', atm: '🏧', tmoney: '🟧', train: '🚄' };
