// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8L AI REGRESSION ENGINE SERVICE

import { RegressionComparison, AIEvaluationResult } from '../types/aiEvaluation';

const HISTORICAL_EVALUATIONS: Array<{ version: string; score: number; results: AIEvaluationResult[] }> = [
  {
    version: 'v1.3.0-8J',
    score: 94,
    results: []
  }
];

export class AIRegressionEngineService {
  /**
   * Compare current evaluation results with previous evaluation version to detect score regressions
   */
  public static checkRegression(
    currentVersion: string,
    currentScore: number,
    currentResults: AIEvaluationResult[]
  ): RegressionComparison {
    const previous = HISTORICAL_EVALUATIONS[0] || { version: 'v1.3.0-8J', score: 94, results: [] };
    const delta = currentScore - previous.score;

    let status: 'IMPROVED' | 'STABLE' | 'REGRESSED' = 'STABLE';
    if (delta > 0) status = 'IMPROVED';
    else if (delta < 0) status = 'REGRESSED';

    // Find tests that scored lower than previously or failed
    const regressedTests = currentResults.filter((r) => r.status === 'FAIL').map((r) => r.testId);

    return {
      evaluationVersion: currentVersion,
      previousOverallScore: previous.score,
      currentOverallScore: currentScore,
      delta,
      status,
      regressedTests
    };
  }
}
