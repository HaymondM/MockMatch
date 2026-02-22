'use client';

import { useState } from 'react';

interface JobDescriptionFormProps {
  onSubmit: (jobDescription: string) => Promise<void>;
}

const EXAMPLE_JOB_DESCRIPTIONS = {
  software: `Senior Full-Stack Software Engineer

We are seeking an experienced Full-Stack Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.

Key Responsibilities:
- Design and implement robust, scalable web applications
- Collaborate with cross-functional teams to define and ship new features
- Write clean, maintainable code with comprehensive test coverage
- Participate in code reviews and mentor junior developers
- Optimize application performance and user experience

Required Skills:
- 5+ years of experience in full-stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with RESTful APIs and GraphQL
- Solid understanding of database design (PostgreSQL, MongoDB)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Strong problem-solving and algorithm design skills
- Excellent communication and teamwork abilities

Nice to Have:
- Experience with microservices architecture
- Knowledge of containerization (Docker, Kubernetes)
- Familiarity with CI/CD pipelines
- Open source contributions`,

  devops: `DevOps Engineer - Infrastructure & Automation

Join our DevOps team to build and maintain highly available, scalable infrastructure. You will work on automating deployment pipelines, managing cloud resources, and ensuring system reliability.

Key Responsibilities:
- Design and implement infrastructure as code using Terraform
- Build and maintain CI/CD pipelines for multiple applications
- Monitor system performance and implement improvements
- Manage Kubernetes clusters and container orchestration
- Implement security best practices across infrastructure
- Collaborate with development teams on deployment strategies

Required Skills:
- 4+ years of experience in DevOps or Site Reliability Engineering
- Strong experience with AWS, Azure, or Google Cloud Platform
- Proficiency in Kubernetes and Docker containerization
- Experience with infrastructure as code (Terraform, CloudFormation)
- Strong scripting skills (Python, Bash, or Go)
- Experience with monitoring tools (Prometheus, Grafana, DataDog)
- Understanding of networking, security, and system administration

Nice to Have:
- Experience with service mesh (Istio, Linkerd)
- Knowledge of GitOps practices (ArgoCD, Flux)
- Certification in cloud platforms
- Experience with incident management and on-call rotation`,

  security: `Security Engineer - Application Security

We are looking for a Security Engineer to strengthen our application security posture. You will conduct security assessments, implement security controls, and work with development teams to build secure applications.

Key Responsibilities:
- Conduct security assessments and penetration testing
- Perform threat modeling for new features and systems
- Review code for security vulnerabilities
- Implement and maintain security tools (SAST, DAST, SCA)
- Develop security standards and best practices
- Respond to security incidents and conduct root cause analysis
- Provide security training to development teams

Required Skills:
- 4+ years of experience in application security or cybersecurity
- Strong understanding of OWASP Top 10 and common vulnerabilities
- Experience with security testing tools (Burp Suite, OWASP ZAP)
- Knowledge of secure coding practices across multiple languages
- Experience with threat modeling methodologies (STRIDE, PASTA)
- Understanding of authentication and authorization mechanisms
- Familiarity with compliance frameworks (SOC 2, ISO 27001)

Nice to Have:
- Security certifications (OSCP, CEH, CISSP)
- Experience with cloud security (AWS Security, Azure Security)
- Knowledge of cryptography and PKI
- Bug bounty program experience`,
};

export default function JobDescriptionForm({ onSubmit }: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const characterCount = jobDescription.length;
  const minCharacters = 50;
  const isValid = characterCount >= minCharacters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError('Job description must be at least 50 characters');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(jobDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const useExample = (example: string) => {
    setJobDescription(example);
    setExpandedExample(null);
    setError(null);
  };

  const toggleExample = (type: string) => {
    setExpandedExample(expandedExample === type ? null : type);
  };

  return (
    <div className="space-y-8">
      {/* Main Form */}
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
              onChange={(e) => {
                setJobDescription(e.target.value);
                setError(null);
              }}
              className={`w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors ${
                error
                  ? 'border-error-500 focus:ring-error-500'
                  : 'border-gray-300'
              }`}
              placeholder="Paste the job description here (minimum 50 characters)..."
              aria-describedby="character-count validation-error"
              aria-invalid={!!error}
            />
            <div className="flex justify-between items-center mt-2">
              <span
                id="character-count"
                className={`text-sm transition-colors ${
                  characterCount === 0
                    ? 'text-gray-500'
                    : isValid
                    ? 'text-success-600 font-medium'
                    : 'text-warning-600'
                }`}
              >
                {characterCount} / {minCharacters} characters
                {characterCount > 0 && !isValid && (
                  <span className="ml-1">
                    ({minCharacters - characterCount} more needed)
                  </span>
                )}
              </span>
              {isValid && (
                <span className="text-sm text-success-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ready to submit
                </span>
              )}
            </div>
          </div>

          {error && (
            <div
              id="validation-error"
              className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg"
              role="alert"
            >
              <p className="text-error-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Interview Questions'
            )}
          </button>
        </form>
      </div>

      {/* Example Job Descriptions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Need an example?
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Software Engineer Example */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Software Engineer
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Full-stack development role with React and Node.js
              </p>
              <button
                onClick={() => toggleExample('software')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
              >
                {expandedExample === 'software' ? 'Hide details' : 'View details'}
              </button>
            </div>
            {expandedExample === 'software' && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans mb-3 max-h-64 overflow-y-auto">
                  {EXAMPLE_JOB_DESCRIPTIONS.software}
                </pre>
                <button
                  onClick={() => useExample(EXAMPLE_JOB_DESCRIPTIONS.software)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Use this example
                </button>
              </div>
            )}
          </div>

          {/* DevOps Engineer Example */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">DevOps Engineer</h4>
              <p className="text-sm text-gray-600 mb-3">
                Infrastructure automation with Kubernetes and AWS
              </p>
              <button
                onClick={() => toggleExample('devops')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
              >
                {expandedExample === 'devops' ? 'Hide details' : 'View details'}
              </button>
            </div>
            {expandedExample === 'devops' && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans mb-3 max-h-64 overflow-y-auto">
                  {EXAMPLE_JOB_DESCRIPTIONS.devops}
                </pre>
                <button
                  onClick={() => useExample(EXAMPLE_JOB_DESCRIPTIONS.devops)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Use this example
                </button>
              </div>
            )}
          </div>

          {/* Security Engineer Example */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Security Engineer
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Application security and threat modeling expertise
              </p>
              <button
                onClick={() => toggleExample('security')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
              >
                {expandedExample === 'security' ? 'Hide details' : 'View details'}
              </button>
            </div>
            {expandedExample === 'security' && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans mb-3 max-h-64 overflow-y-auto">
                  {EXAMPLE_JOB_DESCRIPTIONS.security}
                </pre>
                <button
                  onClick={() => useExample(EXAMPLE_JOB_DESCRIPTIONS.security)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Use this example
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
