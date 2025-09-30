export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Symptom {
  name: string;
  description: string;
  boundingBox: BoundingBox;
  anatomicalLayer: string;
}

export interface DifferentialDiagnosis {
    name: string;
    reasoning: string;
}

export interface AnalysisResult {
  isHealthy: boolean;
  primaryDiagnosis: string;
  summary: string;
  symptoms: Symptom[];
  possibleSymptoms: string[];
  treatment: string;
  confidenceScore: number;
  nextSteps: string;
  differentialDiagnoses: DifferentialDiagnosis[];
}