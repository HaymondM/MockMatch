'use client';

import { useRouter } from 'next/navigation';
import JobDescriptionForm from '@/components/JobDescriptionForm';
import { ParsedJobDescription } from '@/types/index';

export default function Home() {
  const router = useRouter();

  const handleSubmit = async (jobDescription: string) => {
    try {
      // Call the parse-jd API endpoint
      const response = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription }),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse job description');
      }

      // Parse the successful response
      const parsedJD: ParsedJobDescription = await response.json();

      // Store the parsed job description in session storage
      sessionStorage.setItem('parsedJobDescription', JSON.stringify(parsedJD));

      // Navigate to the interview page
      router.push('/interview');
    } catch (error) {
      // Re-throw the error so the form component can display it
      throw error;
    }
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
        <JobDescriptionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
