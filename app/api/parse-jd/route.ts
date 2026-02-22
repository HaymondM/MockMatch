import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOpenAIClient,
  withRetry,
  ValidationError,
  OpenAIError,
} from '@/lib/openai-client';
import {
  ParsedJobDescription,
  ParsedJobDescriptionSchema,
  RoleType,
  ExperienceLevel,
} from '@/types/index';

/**
 * Request body schema
 */
const RequestSchema = z.object({
  jobDescription: z.string().min(50, {
    message: 'Job description must be at least 50 characters',
  }),
});

/**
 * OpenAI response schema for structured output
 */
const OpenAIResponseSchema = z.object({
  roleType: z.enum(['software', 'devops', 'security']),
  skills: z.array(z.string()).min(1),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'staff']),
  technologies: z.array(z.string()),
  responsibilities: z.array(z.string()),
});

/**
 * Build the OpenAI prompt for job description parsing
 */
function buildParsingPrompt(jobDescription: string): string {
  return `Analyze the following job description and extract structured information.

Job Description:
${jobDescription}

Extract the following information:
1. roleType: Classify the role as one of: "software" (software engineering, full-stack, backend, frontend), "devops" (infrastructure, cloud, automation, SRE), or "security" (security engineering, cybersecurity, AppSec, InfoSec)
2. skills: List all required skills mentioned (e.g., "problem solving", "communication", "leadership")
3. experienceLevel: Determine the experience level as one of: "junior" (0-2 years), "mid" (3-5 years), "senior" (6-10 years), or "staff" (10+ years or staff/principal level)
4. technologies: List all technologies, programming languages, frameworks, and tools mentioned (e.g., "Python", "React", "AWS", "Docker")
5. responsibilities: List the key responsibilities mentioned in the job description

Return the information in JSON format with these exact field names.`;
}

/**
 * Parse job description using OpenAI API
 */
async function parseJobDescription(
  jobDescription: string
): Promise<ParsedJobDescription> {
  const openai = getOpenAIClient();
  const prompt = buildParsingPrompt(jobDescription);

  // Call OpenAI API with retry logic
  const completion = await withRetry(
    async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert technical recruiter. Parse job descriptions and extract structured information. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
    },
    'Job description parsing'
  );

  // Extract and parse the response
  const responseContent = completion.choices[0]?.message?.content;

  if (!responseContent) {
    throw new OpenAIError('OpenAI returned an empty response', undefined, true);
  }

  let parsedResponse: any;
  try {
    parsedResponse = JSON.parse(responseContent);
  } catch (error) {
    throw new OpenAIError(
      'Failed to parse OpenAI response as JSON',
      error,
      false
    );
  }

  // Validate the response structure
  const validationResult = OpenAIResponseSchema.safeParse(parsedResponse);

  if (!validationResult.success) {
    throw new OpenAIError(
      `OpenAI response does not match expected schema: ${validationResult.error.message}`,
      validationResult.error,
      false
    );
  }

  // Construct the final ParsedJobDescription
  const result: ParsedJobDescription = {
    roleType: validationResult.data.roleType as RoleType,
    skills: validationResult.data.skills,
    experienceLevel: validationResult.data.experienceLevel as ExperienceLevel,
    technologies: validationResult.data.technologies,
    responsibilities: validationResult.data.responsibilities,
    rawDescription: jobDescription,
  };

  // Final validation with the full schema
  const finalValidation = ParsedJobDescriptionSchema.safeParse(result);

  if (!finalValidation.success) {
    throw new OpenAIError(
      `Parsed job description failed final validation: ${finalValidation.error.message}`,
      finalValidation.error,
      false
    );
  }

  return result;
}

/**
 * POST /api/parse-jd
 * Parse a job description and extract structured information
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: validationResult.error.errors[0]?.message || 'Invalid input',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { jobDescription } = validationResult.data;

    // Parse the job description
    const parsedJD = await parseJobDescription(jobDescription);

    // Return the parsed result
    return NextResponse.json(parsedJD, { status: 200 });
  } catch (error: any) {
    console.error('Error in parse-jd API route:', error);

    // Handle ValidationError
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: error.message,
          details: error.details,
        },
        { status: 400 }
      );
    }

    // Handle OpenAIError
    if (error instanceof OpenAIError) {
      // Rate limit error
      if ((error.originalError as any)?.status === 429) {
        return NextResponse.json(
          {
            error: 'RateLimitError',
            message: 'OpenAI API rate limit exceeded. Please try again later.',
            details: { retryable: true },
          },
          { status: 429 }
        );
      }

      // Timeout error
      if (
        (error.originalError as any)?.code === 'ETIMEDOUT' ||
        (error.originalError as any)?.code === 'ECONNABORTED'
      ) {
        return NextResponse.json(
          {
            error: 'TimeoutError',
            message: 'Request timed out. Please try again.',
            details: { retryable: true },
          },
          { status: 504 }
        );
      }

      // Generic OpenAI error
      return NextResponse.json(
        {
          error: 'OpenAIError',
          message: error.message,
          details: { retryable: error.retryable },
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'InternalServerError',
        message: 'An unexpected error occurred while parsing the job description',
        details: { message: error?.message || 'Unknown error' },
      },
      { status: 500 }
    );
  }
}
