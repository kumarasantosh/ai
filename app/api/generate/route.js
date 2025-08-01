import { generateContent } from "../../../lib/gemini";
import { NextResponse } from "next/server";
import { estimateGpt4oMiniCost } from "../../../lib/token";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, ingestedData } = body;

    let enhancedPrompt;

    if (prompt && prompt.trim() !== "") {
      // Custom prompt provided
      enhancedPrompt = `
        ${prompt}
        
        Based on this data: ${JSON.stringify(ingestedData)}
      `;
    } else {
      // Auto-generate summary
      enhancedPrompt = `You are provided with a document that includes:

- 'Title': ${ingestedData?.title || "No title"}
- 'Content': ${ingestedData?.prompt || "No content"}

geneate the prompt under 5000 tokens make sure it is complete

Generate a vibrant, clean, and visually appealing HTML page that deeply summarizes and expands upon the provided content. The output must: 

the page should be neat without too color use only if required

Main Title:

Begin with a large, boldly styled <h1> for the document's title.

The title should be center-aligned, using a vibrant and modern color.

Apply a subtle text-shadow for depth and elegance.

Introductory Paragraph:

Include an introductory <p> summarizing the overall purpose or theme in at least 2–5 thoughtfully written sentences.

The introduction should be wrapped in a softly colored background block (such as a gentle gradient or pastel), softly rounded corners, increased padding, and use subtle highlights (bold/color) for essential keywords.

Content Sections:

Break down the main content into organized sections:

Use <h2> for section headings, left-aligned, with each in a distinct accent color for visual separation and navigation.

<p> elements beneath each <h2> should be detailed, with thorough explanations, justified text, larger font size, and generous line spacing.

Bold or use accent colors to highlight critical insights or keywords.

Where useful, call out “Key Concepts” by wrapping them in separate shaded boxes or gradients.

When providing examples, use analogies or relatable scenarios for clarity.

Optionally include <ul>, <ol>, and <li> lists with custom marker or number coloring and slightly larger spacing.

Space out sections well for easy scanning—avoid content crowding.

For statistics, facts, or tips, use color-blocks or badge-like spans for attention.

Styling Requirements (Inline CSS only):

Use a soft, clean main background (suggestion: #f9f9f9 or a soft linear gradient).

Font: Only modern sans-serif—prefer 'Arial', 'Helvetica', or 'sans-serif'.

Headings:

<h1>: 2.8em–3em font-size, high color contrast, center, bold.

<h2>: 2em–2.2em font-size, strong color, left-aligned, spaced above and below.

Paragraphs: 1.22–1.26em font-size, justified, comfortable line-height (1.7+), good color contrast.

Section wrappers, highlight boxes: use soft border-radius (12–18px), pastel background accents, and subtle box-shadows.

Give each major section generous margin and padding for a luxurious, readable feel.

Use creative accent borders or colored accents for headings and boxes.

Never crowd content vertically; space generously.

Ensure incredible readability: excellent color contrast, clear hierarchy, never too dense or small.

Presentation & Output Restrictions:

Never include: JavaScript, dynamic content, or any outer <html>, <head>, or <body> tags.

Never use: Markdown, triple backticks, quotation marks at the start, end, or anywhere as wrappers.

Nothing but a full, directly usable HTML string.

The first character must be the actual opening tag (e.g., <div>), never any quote, backtick, or other extraneous character.

Tone & Depth:

Voice should be welcoming, empowering, and suitable for an advanced educational or knowledge-sharing platform, with content as detailed and insightful as possible for each section.

Pose and answer possible questions a reader may have, provide actionable tips, and demonstrate empathy for learners at different stages.

Example Use of "Important" Highlighting:

Key phrases/statistics in <span>s with background colors or bold fonts, “Did you know?" callouts, and similar visually engaging features.

REMINDER:
This HTML must be ready to inject via dangerouslySetInnerHTML (React/Next.js), with professional, readable, and memorable visual quality, and the most detailed, rich content possible.
Do not wrap in any quotes, blockquotes, backticks, Markdown, or extraneous characters. Output pure, fully inlined CSS HTML only.

You can further tailor this prompt by giving example color values or accent colors if your brand or design prefers specific palettes (e.g., hues of blue, green, orange, purple, etc.), or specifying minimum padding/margin values for even more precise layout control.

`;
    }

    const generatedContent = await generateContent(enhancedPrompt);
    const estimate = estimateGpt4oMiniCost(generatedContent);
    console.log("Estimated Cost:", estimate);

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
