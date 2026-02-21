# MockMatch - AI-Powered Interview Preparation

MockMatch is an AI-powered interview preparation tool that helps candidates practice for technical interviews. The system analyzes job descriptions, generates role-specific interview questions, and provides feedback on candidate responses.

## Features

- **Job Description Parsing**: Automatically extracts role type, skills, and requirements
- **Role-Specific Questions**: Generates tailored questions for software, DevOps, and security roles
- **Interactive Interview**: Realistic mock interview experience with progress tracking
- **AI Feedback**: Detailed feedback on answers with strengths and improvement areas
- **Session Management**: Save and resume interview sessions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.x
- **AI Integration**: OpenAI API (GPT-4)
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library + fast-check

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (job description input)
│   ├── interview/         # Interview interface
│   └── results/           # Results and feedback view
├── components/            # React components (to be added)
├── lib/                   # Business logic and utilities (to be added)
├── types/                 # TypeScript interfaces and Zod schemas
├── tests/                 # Test files
└── public/               # Static assets (to be added)
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/components/*` → `./components/*`
- `@/lib/*` → `./lib/*`
- `@/types/*` → `./types/*`
- `@/app/*` → `./app/*`

## Development Status

✅ Task 1: Project infrastructure and core types - **COMPLETED**
- Next.js 14 project initialized
- TypeScript configured with strict mode
- Tailwind CSS set up with custom color palette
- Core interfaces and types defined
- Basic page structure created

## License

MIT
