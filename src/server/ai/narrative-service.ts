import {
  GeneratedNarrative,
  NarrativeGenerationContext,
} from "@/domain/narratives/blueprint";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "@/domain/narratives/strategy";
import { OpenAIProvider } from "@/server/ai/openai-provider";

export class NarrativeService {
  constructor(
    private readonly provider = new OpenAIProvider()
  ) {}

  async generateNarrative(
    context: NarrativeGenerationContext
  ): Promise<GeneratedNarrative> {
    const systemPrompt = buildSystemPrompt(context);
    const userPrompt = buildUserPrompt(context);

    return this.provider.generate({ systemPrompt, userPrompt });
  }
}
