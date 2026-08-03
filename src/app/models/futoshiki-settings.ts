import { ProviderStrategy } from './provider-strategy';
import { Difficulty } from './difficulty';

export interface FutoshikiSettings {
    size: number;
    difficulty: Difficulty;
    strategy: ProviderStrategy;
}
