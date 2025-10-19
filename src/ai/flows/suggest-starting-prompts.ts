'use server';

/**
 * @fileOverview A flow for suggesting starting prompts to new users.
 *
 * - suggestStartingPrompts - A function that suggests starting prompts.
 * - SuggestStartingPromptsOutput - The return type for the suggestStartingPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStartingPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of suggested starting prompts.'),
});
export type SuggestStartingPromptsOutput = z.infer<
  typeof SuggestStartingPromptsOutputSchema
>;

export async function suggestStartingPrompts(): Promise<SuggestStartingPromptsOutput> {
  return suggestStartingPromptsFlow({});
}

const prompt = ai.definePrompt({
  name: 'suggestStartingPromptsPrompt',
  output: {schema: SuggestStartingPromptsOutputSchema},
  prompt: `You are a helpful AI assistant that suggests starting prompts for a collaborative chat application.

  Suggest 3 diverse and engaging prompts to help new users understand the possibilities of the application.
  The prompts should be open-ended and encourage interaction with the AI and other users.
  The prompts should be suitable for a general audience.

  Format the prompts as a JSON array of strings.
  Example:
  {
    "prompts": [
      "What are the biggest challenges facing the world today?",
      "If you could have any superpower, what would it be and why?",
      "What is your favorite book and why?"
    ]
  }`,
});

const suggestStartingPromptsFlow = ai.defineFlow(
  {
    name: 'suggestStartingPromptsFlow',
    outputSchema: SuggestStartingPromptsOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
