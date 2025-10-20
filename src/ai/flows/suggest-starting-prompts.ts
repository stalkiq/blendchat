'use server';

// Minimal, no-Genkit fallback to avoid requiring Gemini keys in dev/prod.

export type SuggestStartingPromptsOutput = { prompts: string[] };

export async function suggestStartingPrompts(): Promise<SuggestStartingPromptsOutput> {
  return {
    prompts: [
      'Plan a weekend trip with friends. Set budget and roles.',
      'Draft a team standup summary from these notes.',
      'Brainstorm 5 product ideas and evaluate pros/cons.',
    ],
  };
}
