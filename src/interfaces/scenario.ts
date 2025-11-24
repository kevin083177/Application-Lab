export interface Scenario {
    _id: string;
    title: string;
    description: string;
    options: ScenarioOption[];
}

export interface ScenarioOption {
  optionId: string;
  text: string;
  consequence: string;
  nextScenarioId: string | null;
}

export interface VoteResult { 
  winningOptionId: string;
  voteCounts: Record<string, number>;
  nextScenarioId: string | null;
  consequence: string;
}