'use client';

import { useState } from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (jobDescription.length < 50) {
      setError('Job description must be at least 50 characters');
      return;
    }

    setIsLoading(true);
    // TODO: Implement API call to parse job description
    console.log('Submitting job description:', jobDescription);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ace Your Next Technical Interview
          </h1>
          <p className="text-lg text-gray-600">
            Get AI-powered mock interviews tailored to your target role.
            Practice with realistic questions and receive detailed feedback.
          </p>
        </div>

        {/* Job Description Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Start Your Mock Interview
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Paste the job description
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Paste the job description here (minimum 50 characters)..."
              />
              <div className="flex justify-between items-center mt-2">
                <span
                  className={`text-sm ${
                    jobDescription.length < 50
                      ? 'text-gray-500'
                      : 'text-success-600'
                  }`}
                >
                  {jobDescription.length} / 50 characters
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || jobDescription.length < 50}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Generate Interview Questions'}
            </button>
          </form>
        </div>

        {/* Example Job Descriptions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need an example?
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Software Engineer
              </h4>
              <p className="text-sm text-gray-600">
                Full-stack development role with React and Node.js
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">DevOps Engineer</h4>
              <p className="text-sm text-gray-600">
                Infrastructure automation with Kubernetes and AWS
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Security Engineer
              </h4>
              <p className="text-sm text-gray-600">
                Application security and threat modeling expertise
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
