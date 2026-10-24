import dotenv from 'dotenv';
import { generateApplicationMaterials, getProviderConfig } from './src/server/generator.ts';

dotenv.config();

// Realistic sample input for smoke testing
const SAMPLE_INPUT = {
  jobTitle: 'Senior Frontend Engineer',
  company: 'Apex Cloud Solutions',
  recruiterName: 'Sarah Jenkins',
  applicantName: 'Alex Morgan',
  applicantExperience: '6 years of engineering experience with React, TypeScript, state management, and modern responsive UI design. Track record of improving web app load times by 40% and mentoring junior engineers.',
  tone: 'professional' as const,
  jobDescription: `
Apex Cloud Solutions is looking for a Senior Frontend Engineer to lead our core web console team.
Requirements:
- 5+ years of experience with React, TypeScript, and modern CSS frameworks.
- Deep understanding of client-side performance, accessibility, and component libraries.
- Proven experience collaborating with product designers and backend engineers.
- Passion for crafting clean, intuitive developer workflows and dashboards.
Responsibilities:
- Architect and build high-performance web applications using modern React.
- Drive best practices in frontend testing, reusability, and design system alignment.
- Lead code reviews and foster an inclusive engineering culture.
`,
};

async function runSmokeTest() {
  const config = getProviderConfig();

  console.log('--------------------------------------------------');
  console.log('🧪 RUNNING GEMMA 4 SMOKE TEST');
  console.log(`Active Provider : ${config.provider.toUpperCase()}`);
  console.log(`Model ID        : ${config.model}`);
  if (config.provider === 'api') {
    console.log(`API Key Status  : ${config.hasApiKey ? 'PRESENT' : 'MISSING'}`);
  } else {
    console.log(`Ollama Host     : ${config.ollamaHost}`);
  }
  console.log('--------------------------------------------------');
  console.log('Sending realistic sample job posting to Gemma 4...');

  try {
    const startTime = Date.now();
    const result = await generateApplicationMaterials(SAMPLE_INPUT);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`Response received in ${duration}s.`);

    // Validation checks
    const errors: string[] = [];

    if (!result.coverLetter || result.coverLetter.length < 80) {
      errors.push('Cover letter is missing or suspiciously short.');
    }
    if (!result.emailSubject || result.emailSubject.length < 5) {
      errors.push('Recruiter email subject line is missing or empty.');
    }
    if (!result.emailBody || result.emailBody.length < 50) {
      errors.push('Recruiter email body is missing or too short.');
    }
    if (!Array.isArray(result.keyStrengths) || result.keyStrengths.length === 0) {
      errors.push('Key matching strengths list is empty.');
    }

    if (errors.length > 0) {
      console.error('\n❌ VALIDATION ERRORS:');
      errors.forEach((e) => console.error(` - ${e}`));
      console.log('\n========================================');
      console.log('FAIL');
      console.log('========================================');
      process.exit(1);
    }

    console.log('\n--- Sample Generated Output Previews ---');
    console.log(`Email Subject: ${result.emailSubject}`);
    console.log(`Email Preview: ${result.emailBody.slice(0, 150).replace(/\n/g, ' ')}...`);
    console.log(`Cover Letter Preview: ${result.coverLetter.slice(0, 150).replace(/\n/g, ' ')}...`);
    console.log(`Key Strengths Found: ${result.keyStrengths.length}`);

    console.log('\n========================================');
    console.log('PASS');
    console.log('========================================');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ SMOKE TEST ENCOUNTERED AN ERROR:');
    console.error(err.message || err);
    console.log('\n========================================');
    console.log('FAIL');
    console.log('========================================');
    process.exit(1);
  }
}

runSmokeTest();
