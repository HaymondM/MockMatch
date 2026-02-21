'use client';

export default function ResultsPage() {
  // Placeholder data - will be replaced with actual session data
  const mockResults = {
    overallScore: 7.5,
    performanceSummary: {
      behavioral: 8.0,
      technical: 7.0,
      systemDesign: 7.5,
    },
    strongestAreas: ['Communication', 'Problem-solving approach'],
    improvementAreas: ['Code optimization', 'System scalability'],
    recommendations: [
      'Practice more algorithm optimization problems',
      'Study distributed systems patterns',
    ],
  };

  const mockQuestions = [
    {
      id: '1',
      type: 'technical',
      question: 'Explain the difference between REST and GraphQL APIs.',
      answer:
        'REST uses multiple endpoints while GraphQL uses a single endpoint...',
      feedback: {
        score: 7,
        strengths: ['Clear explanation', 'Good examples'],
        improvements: ['Could mention performance trade-offs', 'Add more detail on caching'],
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interview Results
          </h1>
          <p className="text-gray-600">
            Here's how you performed in your mock interview
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary-100 mb-4">
              <span className="text-4xl font-bold text-primary-700">
                {mockResults.overallScore}
              </span>
              <span className="text-xl text-primary-600">/10</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Overall Score
            </h2>
            <p className="text-gray-600">Great job! Keep practicing to improve further.</p>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Performance by Question Type
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Behavioral</span>
                <span className="text-gray-900 font-semibold">
                  {mockResults.performanceSummary.behavioral}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-success-500 h-3 rounded-full"
                  style={{
                    width: `${mockResults.performanceSummary.behavioral * 10}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Technical</span>
                <span className="text-gray-900 font-semibold">
                  {mockResults.performanceSummary.technical}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full"
                  style={{
                    width: `${mockResults.performanceSummary.technical * 10}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">System Design</span>
                <span className="text-gray-900 font-semibold">
                  {mockResults.performanceSummary.systemDesign}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-warning-500 h-3 rounded-full"
                  style={{
                    width: `${mockResults.performanceSummary.systemDesign * 10}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-success-700 mb-4">
              Strongest Areas
            </h3>
            <ul className="space-y-2">
              {mockResults.strongestAreas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-success-500 mr-2">✓</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-warning-700 mb-4">
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {mockResults.improvementAreas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-warning-500 mr-2">→</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {mockResults.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Question-by-Question Review
          </h3>
          <div className="space-y-6">
            {mockQuestions.map((q, index) => (
              <div key={q.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="text-sm text-gray-500">
                      Question {index + 1}
                    </span>
                    <h4 className="text-lg font-medium text-gray-900 mt-1">
                      {q.question}
                    </h4>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {q.feedback.score}/10
                  </span>
                </div>
                <div className="bg-gray-50 rounded p-4 mb-3">
                  <p className="text-sm text-gray-700">{q.answer}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-success-700 mb-2">
                      Strengths
                    </h5>
                    <ul className="text-sm space-y-1">
                      {q.feedback.strengths.map((s, i) => (
                        <li key={i} className="text-gray-700">
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-warning-700 mb-2">
                      Improvements
                    </h5>
                    <ul className="text-sm space-y-1">
                      {q.feedback.improvements.map((imp, i) => (
                        <li key={i} className="text-gray-700">
                          • {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Start New Interview
          </button>
          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
