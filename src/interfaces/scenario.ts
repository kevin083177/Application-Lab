export interface Scenario {
    _id: string;
    title: string;
    description: string;
    options: ScenarioOption[];
}

export interface ScenarioOption {
    text: string;
    nextScenarioId: string | null;
}