import { GoogleGenAI } from '@google/genai';

export interface GenerationInput {
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  applicantName?: string;
  applicantExperience?: string;
  tone?: 'professional' | 'enthusiastic' | 'direct' | 'creative';
  recruiterName?: string;
}

export interface GenerationResult {
  provider: 'api' | 'local';
  model: string;
  coverLetter: string;
  emailSubject: string;
  emailBody: string;
  keyStrengths: string[];
}

export interface ProviderStatus {
  provider: 'api' | 'local';
  model: string;
  hasApiKey: boolean;
  ollamaHost: string;
}

export function getProviderConfig(): ProviderStatus {
  const provider = (process.env.PROVIDER || 'api').toLowerCase() === 'local' ? 'local' : 'api';
  const model = provider === 'api'
    ? (process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it')
    : (process.env.OLLAMA_MODEL || 'gemma4:e2b');

  return {
    provider,
    model,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
  };
}

/**
 * Unified generation function supporting both Google AI Studio Gemma 4
 * and local Ollama Gemma 4.
 */
export async function generateApplicationMaterials(input: GenerationInput): Promise<GenerationResult> {
  const config = getProviderConfig();

  const toneInstruction = {
    professional: 'professional, confident, polished, and compelling',
    enthusiastic: 'passionate, high-energy, authentic, and modern',
    direct: 'concise, punchy, results-oriented, and high-impact',
    creative: 'engaging, memorable, storytelling-focused, and personable',
  }[input.tone || 'professional'];

  const prompt = `You are an expert career strategist and executive resume writer powered by Gemma 4.
Craft high-converting job application materials tailored strictly to the provided job description and candidate background.

### APPLICANT DETAILS:
- Candidate Name: ${input.applicantName?.trim() || '[Your Name]'}
- Relevant Experience/Skills: ${input.applicantExperience?.trim() || 'Strong relevant background matching the job requirements'}
- Recruiter / Hiring Contact: ${input.recruiterName?.trim() || 'Hiring Team'}

### TARGET ROLE:
- Job Title: ${input.jobTitle?.trim() || 'Role as specified in job description'}
- Company: ${input.company?.trim() || 'The Company'}
- Desired Tone: ${toneInstruction}

### JOB DESCRIPTION:
"""
${input.jobDescription.trim()}
"""

### OUTPUT INSTRUCTIONS:
Produce four exact sections marked by tags. Do not skip any tags:

===COVER_LETTER===
Write a complete, compelling 3-4 paragraph cover letter that highlights relevant achievements, directly addresses the employer's core pain points in the job description, and has a strong call to action.

===EMAIL_SUBJECT===
Write a high-open-rate recruiter outreach email subject line (under 60 characters, e.g. "Application: [Role] - [Candidate Name]").

===EMAIL_BODY===
Write a concise, punchy 2-3 paragraph recruiter email suitable for direct messaging or cold outreach. It should be quick to scan and invite a 10-minute introductory conversation.

===KEY_STRENGTHS===
List 3-4 bullet points highlighting the candidate's top matching strengths, skills, or metrics aligned directly with this job description.`;

  let rawOutput = '';

  if (config.provider === 'api') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set. Please set GEMINI_API_KEY or switch to PROVIDER=local.');
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    rawOutput = response.text || '';
  } else {
    // Local provider (Ollama)
    const ollamaUrl = `${config.ollamaHost}/api/generate`;
    try {
      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as { response?: string };
      rawOutput = data.response || '';
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('fetch failed')) {
        throw new Error(`Could not connect to Ollama at ${config.ollamaHost}. Is Ollama running? (Command: 'ollama run ${config.model}')`);
      }
      throw err;
    }
  }

  // Parse sections
  return {
    provider: config.provider,
    model: config.model,
    ...parseSections(rawOutput, input),
  };
}

function parseSections(raw: string, input: GenerationInput) {
  const coverLetterMatch = raw.match(/===COVER_LETTER===([\s\S]*?)(?====EMAIL_SUBJECT===|===EMAIL_BODY===|===KEY_STRENGTHS===|$)/i);
  const emailSubjectMatch = raw.match(/===EMAIL_SUBJECT===([\s\S]*?)(?====EMAIL_BODY===|===KEY_STRENGTHS===|$)/i);
  const emailBodyMatch = raw.match(/===EMAIL_BODY===([\s\S]*?)(?====KEY_STRENGTHS===|$)/i);
  const keyStrengthsMatch = raw.match(/===KEY_STRENGTHS===([\s\S]*?)$/i);

  let coverLetter = coverLetterMatch ? coverLetterMatch[1].trim() : '';
  let emailSubject = emailSubjectMatch ? emailSubjectMatch[1].trim() : '';
  let emailBody = emailBodyMatch ? emailBodyMatch[1].trim() : '';
  const keyStrengthsText = keyStrengthsMatch ? keyStrengthsMatch[1].trim() : '';

  // Fallbacks if tags were slightly altered by the model
  if (!coverLetter && !emailBody) {
    coverLetter = raw.trim();
    emailSubject = `Application: ${input.jobTitle || 'Opportunity'} - ${input.applicantName || 'Candidate'}`;
    emailBody = `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${input.jobTitle || 'role'} at ${input.company || 'your organization'}. Please find my cover letter attached.\n\nBest regards,\n${input.applicantName || '[Your Name]'}`;
  }

  if (!emailSubject) {
    emailSubject = `Application: ${input.jobTitle || 'Exciting Role'} - ${input.applicantName || 'Applicant'}`;
  }

  const keyStrengths: string[] = [];
  if (keyStrengthsText) {
    const lines = keyStrengthsText.split('\n');
    for (const line of lines) {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (clean) keyStrengths.push(clean);
    }
  }

  if (keyStrengths.length === 0) {
    keyStrengths.push(
      'Direct alignment with key responsibilities specified in the role description',
      'Demonstrated experience with required core technologies and domain requirements',
      'Strong communication and cross-functional collaboration readiness'
    );
  }

  return {
    coverLetter,
    emailSubject,
    emailBody,
    keyStrengths,
  };
}
