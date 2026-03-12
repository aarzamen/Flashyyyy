import Anthropic from '@anthropic-ai/sdk';
import { METAPHOR_BANK } from './constants';

let client: Anthropic | null = null;

function getClient(): Anthropic {
    if (!client) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured. Add it to .env.local');
        client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    }
    return client;
}

export interface DirectionMeta {
    name: string;
    philosophy: string;
    metaphor: string;
}

export async function generateDirectionNames(prompt: string): Promise<DirectionMeta[]> {
    const ai = getClient();

    const shuffled = [...METAPHOR_BANK].sort(() => 0.5 - Math.random());
    const sampleMetaphors = shuffled.slice(0, 5).map((m, i) => `${i + 1}. ${m}`).join('\n');

    const response = await ai.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
            role: 'user',
            content: `Generate 3 radically different design direction concepts for this UI prompt: "${prompt}"

Each direction must embody a fundamentally different design philosophy — not color variations, but different worldviews about how this interface should feel.

Here are some metaphor examples for inspiration (invent your own that fit this specific prompt):
${sampleMetaphors}

Return ONLY a JSON array of exactly 3 objects, each with:
- "name": A short, evocative 2-3 word name (e.g., "Liquid Glass", "Pressed Linen")
- "philosophy": One sentence describing the core visual approach
- "metaphor": The material/physical metaphor driving every CSS decision

JSON only, no markdown formatting.`
        }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    try {
        const parsed = JSON.parse(text.trim());
        if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed.slice(0, 3);
        }
    } catch {
        // Try extracting JSON from the response
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 3);
        }
    }
    // Fallback
    return [
        { name: "Structural Grid", philosophy: "Mathematical precision with exposed systems", metaphor: "Architectural blueprint" },
        { name: "Fluid Organic", philosophy: "Living surfaces with breathing motion", metaphor: "Bioluminescent organism" },
        { name: "Bold Editorial", philosophy: "Magazine-grade typography hierarchy", metaphor: "Printed broadsheet" },
    ];
}

export async function streamDirectionHtml(
    prompt: string,
    meta: DirectionMeta,
    letter: string,
    onChunk: (accumulated: string) => void,
): Promise<string> {
    const ai = getClient();

    const stream = ai.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{
            role: 'user',
            content: `Create a stunning, high-fidelity UI component for: "${prompt}"

DESIGN DIRECTION: "${meta.name}" — ${meta.philosophy}
MATERIAL METAPHOR: ${meta.metaphor}

Use this metaphor to drive every CSS choice. The metaphor isn't decoration — it's the structural logic.

REQUIREMENTS:
1. Return ONLY raw HTML with embedded <style> and <script> tags. No markdown. No explanation.
2. Use distinctive Google Fonts (never Inter, Roboto, or Arial). Load via <link> in <head>.
3. Include realistic, domain-appropriate placeholder data (not Lorem ipsum).
4. Add CSS/JS animations tied to the metaphor (breathing for organic, mechanical for architectural, etc.).
5. Make it responsive. Use modern CSS (custom properties, clamp(), container queries where useful).
6. Include a subtle label in the top-right corner: "Direction ${letter}" in small monospace text at 30% opacity.
7. Ensure proper contrast, focus states, and semantic HTML.
8. Self-contained: no external dependencies except Google Fonts.
9. Dark theme by default unless the metaphor strongly suggests otherwise.
10. Make it MEMORABLE — what's the one thing someone will remember about this design?

Return ONLY the complete HTML document starting with <!DOCTYPE html>.`
        }],
        system: "You are Hydra UI, an elite frontend designer. You output raw HTML documents — no markdown fences, no commentary. Every design is bold, distinctive, and production-grade. You never generate generic or safe designs.",
    });

    let accumulated = '';
    for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            accumulated += event.delta.text;
            onChunk(accumulated);
        }
    }

    return accumulated;
}

export async function generateVariations(
    prompt: string,
    selectedDirection: DirectionMeta,
    selectedHtml: string,
): Promise<AsyncGenerator<{ name: string; html: string }>> {
    const ai = getClient();

    async function* gen() {
        const response = await ai.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            messages: [{
                role: 'user',
                content: `You previously created a UI for "${prompt}" in the "${selectedDirection.name}" direction (${selectedDirection.philosophy}).

Now generate 3 VARIATIONS within this same design philosophy. Same metaphor, different executions:
- Variation 1: Different layout density (more compact or more spacious)
- Variation 2: Different color temperature (warmer or cooler)
- Variation 3: Different animation intensity (more kinetic or more serene)

Return a JSON array of 3 objects with "name" (string) and "html" (full HTML document string).
Each HTML must be complete and self-contained. JSON only, no markdown.`
            }],
        });

        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        let parsed: any[];
        try {
            parsed = JSON.parse(text.trim());
        } catch {
            const match = text.match(/\[[\s\S]*\]/);
            parsed = match ? JSON.parse(match[0]) : [];
        }
        for (const v of parsed) {
            if (v.name && v.html) yield v;
        }
    }
    return gen();
}
