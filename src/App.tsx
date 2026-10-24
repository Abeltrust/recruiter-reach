/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Mail,
  Sparkles,
  Copy,
  Check,
  Download,
  ExternalLink,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Server,
  AlertCircle,
  Briefcase,
  User,
  Send,
  Zap,
} from 'lucide-react';

interface GenerationData {
  provider: 'api' | 'local';
  model: string;
  coverLetter: string;
  emailSubject: string;
  emailBody: string;
  keyStrengths: string[];
}

interface ProviderInfo {
  ok: boolean;
  provider: 'api' | 'local';
  model: string;
  hasApiKey: boolean;
  ollamaHost: string;
}

const PRESET_SAMPLE = {
  jobTitle: 'Senior Frontend Engineer',
  company: 'Apex Cloud Solutions',
  recruiterName: 'Sarah Jenkins',
  applicantName: 'Alex Morgan',
  applicantExperience:
    '6 years building scalable web apps with React, TypeScript, and modern CSS. Led performance initiatives improving load speeds by 40% and mentored junior developers.',
  jobDescription: `Apex Cloud Solutions is looking for a Senior Frontend Engineer to join our core product team.

Responsibilities:
- Build and maintain responsive, high-performance web applications using modern React and TypeScript.
- Collaborate closely with product managers, UX designers, and backend engineers.
- Improve client-side performance, accessibility, and automated component testing.
- Mentor team members and participate in code reviews.

Requirements:
- 5+ years of practical experience with modern JavaScript/TypeScript and React.
- Strong eye for clean UI, responsive design, and intuitive user experiences.
- Experience with RESTful APIs, state management, and modern build tools.
- Excellent communication skills and passion for team collaboration.`,
};

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantExperience, setApplicantExperience] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [tone, setTone] = useState<'professional' | 'direct' | 'enthusiastic' | 'creative'>('professional');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Results & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationData | null>(null);
  const [activeTab, setActiveTab] = useState<'coverLetter' | 'email' | 'strengths'>('coverLetter');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Editable outputs
  const [editableCoverLetter, setEditableCoverLetter] = useState('');
  const [editableEmailBody, setEditableEmailBody] = useState('');
  const [editableEmailSubject, setEditableEmailSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Provider status
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data: ProviderInfo) => {
        setProviderInfo(data);
      })
      .catch((err) => {
        console.warn('Could not fetch server status:', err);
      });
  }, []);

  const handleLoadSample = () => {
    setJobTitle(PRESET_SAMPLE.jobTitle);
    setCompany(PRESET_SAMPLE.company);
    setRecruiterName(PRESET_SAMPLE.recruiterName);
    setApplicantName(PRESET_SAMPLE.applicantName);
    setApplicantExperience(PRESET_SAMPLE.applicantExperience);
    setJobDescription(PRESET_SAMPLE.jobDescription);
    setShowAdvanced(true);
    setError(null);
  };

  const handleClear = () => {
    setJobDescription('');
    setJobTitle('');
    setCompany('');
    setApplicantName('');
    setApplicantExperience('');
    setRecruiterName('');
    setResult(null);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          applicantName: applicantName.trim() || undefined,
          applicantExperience: applicantExperience.trim() || undefined,
          recruiterName: recruiterName.trim() || undefined,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate materials. Please check your provider setup.');
      }

      setResult(data.data);
      setEditableCoverLetter(data.data.coverLetter);
      setEditableEmailSubject(data.data.emailSubject);
      setEditableEmailBody(data.data.emailBody);
      setActiveTab('coverLetter');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getMailtoLink = () => {
    if (!result) return '#';
    const subject = encodeURIComponent(editableEmailSubject || result.emailSubject);
    const body = encodeURIComponent(editableEmailBody || result.emailBody);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">Recruiter Reach</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Gemma 4
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI Cover Letter & Recruiter Email Generator for Job Seekers
              </p>
            </div>
          </div>

          {/* Provider Badge */}
          <div className="flex items-center space-x-3">
            {providerInfo && (
              <div className="flex items-center space-x-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium">
                  {providerInfo.provider === 'api' ? 'Google AI Studio API' : 'Local Ollama'}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-mono text-slate-600 truncate max-w-[140px]">
                  {providerInfo.model}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Provider Ready" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form */}
          <section className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Job Details</h2>
                <p className="text-xs text-slate-500">Paste any job posting or load a sample</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Sample</span>
                </button>
                {(jobDescription || jobTitle) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Job Description Field */}
              <div>
                <label htmlFor="jobDescription" className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  rows={8}
                  required
                  placeholder="Paste the full job posting, responsibilities, or qualifications here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
                <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
                  <span>Characters: {jobDescription.length}</span>
                  <span>Required input</span>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Writing Tone
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'professional', label: '👔 Confident & Pro' },
                    { id: 'direct', label: '⚡ Direct & Concise' },
                    { id: 'enthusiastic', label: '🌟 High-Energy' },
                    { id: 'creative', label: '🎨 Storytelling' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTone(item.id as any)}
                      className={`py-2 px-2.5 rounded-lg border font-medium text-left transition-all ${
                        tone === item.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion: Personalization & Role Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Personalize with Your Name & Experience (Optional)</span>
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-3 bg-white border-t border-slate-200 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Alex Morgan"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Recruiter Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={recruiterName}
                          onChange={(e) => setRecruiterName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Target Job Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Frontend Engineer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Cloud Solutions"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Your Core Experience & Achievements
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. 5+ years in React, reduced page load by 40%, experience leading small teams..."
                        value={applicantExperience}
                        onChange={(e) => setApplicantExperience(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !jobDescription.trim()}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 text-sm disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemma 4 is crafting materials...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Generate Cover Letter & Email</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Generation Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Output View */}
          <section className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[560px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Output & Drafts</h2>
                <p className="text-xs text-slate-500">
                  {result
                    ? `Generated with ${result.model} (${result.provider === 'api' ? 'API' : 'Ollama'})`
                    : 'Your generated cover letter and email will appear here'}
                </p>
              </div>

              {result && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                      isEditing
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isEditing ? 'Done Editing' : 'Edit Text'}
                  </button>
                </div>
              )}
            </div>

            {/* Tab navigation */}
            {result && (
              <div className="flex border-b border-slate-200 mt-4 space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('coverLetter')}
                  className={`pb-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-all ${
                    activeTab === 'coverLetter'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Cover Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className={`pb-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-all ${
                    activeTab === 'email'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Recruiter Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('strengths')}
                  className={`pb-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-all ${
                    activeTab === 'strengths'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Key Alignment Strengths</span>
                </button>
              </div>
            )}

            {/* Content Display */}
            <div className="flex-1 mt-4 flex flex-col">
              {!result && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">No materials generated yet</h3>
                  <p className="text-xs max-w-sm text-slate-500 mb-4">
                    Paste a job description on the left or click "Try Sample" to let Gemma 4 write your application materials in seconds.
                  </p>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    Load Sample Job Posting
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
                      <Sparkles className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Analyzing job requirements with Gemma 4...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Extracting core skills, drafting personalized arguments, and writing an outreach email.
                    </p>
                  </div>
                </div>
              )}

              {result && !isLoading && (
                <div className="flex-1 flex flex-col">
                  {/* TAB 1: COVER LETTER */}
                  {activeTab === 'coverLetter' && (
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                        <span>
                          Word count: {editableCoverLetter.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editableCoverLetter, 'coverLetter')}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                          >
                            {copiedType === 'coverLetter' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              downloadTextFile(
                                editableCoverLetter,
                                `cover-letter-${(company || 'job').toLowerCase().replace(/\s+/g, '-')}.txt`
                              )
                            }
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download .txt</span>
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <textarea
                          rows={14}
                          value={editableCoverLetter}
                          onChange={(e) => setEditableCoverLetter(e.target.value)}
                          className="flex-1 w-full p-4 bg-slate-50 border border-indigo-300 rounded-xl font-sans text-sm text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      ) : (
                        <div className="flex-1 p-5 bg-slate-50/70 border border-slate-200 rounded-xl overflow-y-auto max-h-[500px]">
                          <div className="prose prose-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed text-sm">
                            {editableCoverLetter}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: RECRUITER EMAIL */}
                  {activeTab === 'email' && (
                    <div className="flex-1 flex flex-col space-y-4">
                      {/* Email Subject */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600">Email Subject Line</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editableEmailSubject, 'subject')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                          >
                            {copiedType === 'subject' ? (
                              <span className="text-emerald-600 font-semibold flex items-center">
                                <Check className="w-3 h-3 mr-0.5" /> Copied
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Subject</span>
                              </>
                            )}
                          </button>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableEmailSubject}
                            onChange={(e) => setEditableEmailSubject(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 select-all">
                            {editableEmailSubject}
                          </p>
                        )}
                      </div>

                      {/* Email Body */}
                      <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Recruiter Message Body</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(editableEmailBody, 'emailBody')}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                            >
                              {copiedType === 'emailBody' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Body</span>
                                </>
                              )}
                            </button>
                            <a
                              href={getMailtoLink()}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Open in Email App</span>
                            </a>
                          </div>
                        </div>

                        {isEditing ? (
                          <textarea
                            rows={10}
                            value={editableEmailBody}
                            onChange={(e) => setEditableEmailBody(e.target.value)}
                            className="flex-1 w-full p-4 bg-slate-50 border border-indigo-300 rounded-xl font-sans text-sm text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <div className="flex-1 p-5 bg-slate-50/70 border border-slate-200 rounded-xl overflow-y-auto max-h-[400px]">
                            <div className="prose prose-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed text-sm">
                              {editableEmailBody}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: KEY STRENGTHS */}
                  {activeTab === 'strengths' && (
                    <div className="flex-1 flex flex-col space-y-4">
                      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                          Role Match Analysis
                        </h4>
                        <p className="text-xs text-indigo-700">
                          Use these talking points during your recruiter screening calls, portfolio reviews, or LinkedIn direct messages:
                        </p>
                      </div>

                      <div className="space-y-3">
                        {result.keyStrengths.map((strength, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3"
                          >
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed font-medium">
                              {strength}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              result.keyStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n'),
                              'allStrengths'
                            )
                          }
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                        >
                          {copiedType === 'allStrengths' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied Points!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy All Points</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Powered by <strong>Gemma 4</strong> (Google AI Studio & local Ollama fallback)
          </div>
          <div className="flex items-center space-x-4">
            <span>Provider: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{providerInfo?.provider || 'api'}</code></span>
            <span>Switch via <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">PROVIDER=api|local</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
