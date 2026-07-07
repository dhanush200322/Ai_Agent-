'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateAgent } from '../../hooks/useAgents';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowLeft, ArrowRight, Bot, Loader2, Sparkles, Sliders, AlignLeft, CheckCircle, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { AgentVisibility } from '../../types/agent';

const createAgentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(1).optional(),
  visibility: z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
  avatar: z.any().optional(), // File
  themeConfig: z.object({
    botColor: z.string().optional(),
    theme: z.enum(['dark', 'light']).optional(),
    customCss: z.string().optional(),
  }).optional(),
});

type CreateAgentValues = z.infer<typeof createAgentSchema>;

const STEPS = [
  { id: 'general', title: 'General', icon: Bot },
  { id: 'config', title: 'Configuration', icon: Sliders },
  { id: 'prompt', title: 'Prompt', icon: AlignLeft },
  { id: 'appearance', title: 'Appearance', icon: Palette },
  { id: 'review', title: 'Review', icon: CheckCircle }
];

export function CreateAgentForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { mutateAsync: createAgent, isPending } = useCreateAgent();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateAgentValues>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      model: 'gpt-4o',
      temperature: 0.7,
      topP: 1.0,
      maxTokens: 2048,
      visibility: 'PRIVATE'
    }
  });

  const formValues = watch();

  // Auto-generate slug from name
  React.useEffect(() => {
    if (formValues.name && currentStep === 0) {
      const generatedSlug = formValues.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [formValues.name, setValue, currentStep]);

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Simplified validation check per step could be added here
    setCurrentStep(c => Math.min(STEPS.length - 1, c + 1));
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep(c => Math.max(0, c - 1));
  };

  const onSubmit = async (data: CreateAgentValues) => {
    try {
      const payload: any = { ...data };
      if (payload.themeConfig) {
        payload.themeConfig = JSON.stringify(payload.themeConfig);
      }
      const response = await createAgent(payload);
      toast.success('Agent created successfully!');
      router.push(`/dashboard/agents/${response.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[rgba(255,255,255,0.05)] -z-10" />
        {STEPS.map((step, idx) => {
          const isActive = currentStep === idx;
          const isCompleted = currentStep > idx;
          const StepIcon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-[#0A0A0A] px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]' :
                isCompleted ? 'bg-green-500/20 border border-green-500 text-green-500' :
                'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-500'
              }`}>
                <StepIcon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 md:p-8">
        
        {/* Step 0: General */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Agent Identity</h2>
              <p className="text-gray-400">Define the core identity and purpose of your new AI agent.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name <span className="text-red-500">*</span></label>
                <input
                  {...register('name')}
                  className={`w-full bg-[rgba(255,255,255,0.02)] border ${errors.name ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  placeholder="e.g., Customer Support Bot"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Slug <span className="text-red-500">*</span></label>
                <input
                  {...register('slug')}
                  className={`w-full bg-[rgba(255,255,255,0.02)] border ${errors.slug ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  placeholder="e.g., customer-support-bot"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                placeholder="Briefly describe what this agent does..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Avatar (Optional)</label>
              <div className="flex items-center gap-4">
                {formValues.avatar && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.1)] shrink-0">
                    <img src={URL.createObjectURL(formValues.avatar)} alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue('avatar', file, { shouldValidate: true, shouldDirty: true });
                    }
                    e.target.value = ''; // Reset input so same file can be selected again
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgba(255,255,255,0.05)] file:text-white hover:file:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Configuration */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Agent Configuration</h2>
              <p className="text-gray-400">Select the LLM and tune the generation parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Architecture <span className="text-red-500">*</span></label>
                <select
                  {...register('model')}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                  <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Anthropic Claude 3 Sonnet</option>
                  <option value="llama-3-70b-instruct">Meta Llama 3 70B</option>
                  <option value="mixtral-8x7b-instruct">Mistral Mixtral 8x7B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
                <select
                  {...register('visibility')}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="PRIVATE">Private (Only you)</option>
                  <option value="ORGANIZATION">Organization (Everyone in Org)</option>
                  <option value="PUBLIC">Public (Anyone with link)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temperature <span className="text-[#D4AF37] text-xs font-bold ml-2">{formValues.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0" max="2" step="0.1"
                  {...register('temperature', { valueAsNumber: true })}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Top P <span className="text-[#D4AF37] text-xs font-bold ml-2">{formValues.topP}</span>
                </label>
                <input
                  type="range"
                  min="0" max="1" step="0.05"
                  {...register('topP', { valueAsNumber: true })}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Tokens <span className="text-[#D4AF37] text-xs font-bold ml-2">{formValues.maxTokens}</span>
                </label>
                <input
                  type="number"
                  {...register('maxTokens', { valueAsNumber: true })}
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
            
            {/* Unsupported Features Placeholders as requested by Rule #10 */}
            <div className="mt-8 p-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)]">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Enterprise Features (Coming Soon)
              </h4>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-gray-800/50 rounded text-xs text-gray-500 cursor-not-allowed">Tools Assignment</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded text-xs text-gray-500 cursor-not-allowed">Knowledge Base</span>
                <span className="px-3 py-1 bg-gray-800/50 rounded text-xs text-gray-500 cursor-not-allowed">Custom Colors</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prompt */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">System Prompt</h2>
              <p className="text-gray-400">Give your agent instructions on how to behave and respond.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">System Instructions</label>
                <span className="text-xs text-[#D4AF37] cursor-pointer hover:underline">Use Template</span>
              </div>
              <textarea
                {...register('systemPrompt')}
                rows={12}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Appearance */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Widget Appearance</h2>
              <p className="text-gray-400">Customize how this agent looks in the chat widget on your website.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chat Theme</label>
                <select
                  {...register('themeConfig.theme')}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="dark">Dark Theme (Default)</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bot Icon Color (Hex)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    {...register('themeConfig.botColor')}
                    defaultValue="#eab308"
                    className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    {...register('themeConfig.botColor')}
                    placeholder="#eab308"
                    className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom CSS (Advanced)</label>
              <textarea
                {...register('themeConfig.customCss')}
                rows={6}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl py-4 px-4 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                placeholder="/* Add custom styles for the chat widget here */\n.message-bubble { border-radius: 8px; }"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Review & Create</h2>
              <p className="text-gray-400">Verify your agent configuration before deployment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[rgba(255,255,255,0.02)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm text-white font-medium">{formValues.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Slug</p>
                <p className="text-sm text-white font-mono">{formValues.slug || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-white">{formValues.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Model</p>
                <p className="text-sm text-[#D4AF37] font-medium">{formValues.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Visibility</p>
                <p className="text-sm text-white">{formValues.visibility}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Temp / TopP / Max Tokens</p>
                <p className="text-sm text-white">{formValues.temperature} / {formValues.topP} / {formValues.maxTokens}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(255,255,255,0.05)]">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          ) : <div></div>}
          
          {currentStep < STEPS.length - 1 ? (
            <MagneticButton type="button" onClick={handleNext} variant="primary" className="px-6 py-2">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </MagneticButton>
          ) : (
            <MagneticButton type="submit" variant="primary" className="px-8 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F7D774] text-black">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <>Deploy Agent <Sparkles className="w-4 h-4 ml-2" /></>
              )}
            </MagneticButton>
          )}
        </div>
      </form>
    </div>
  );
}
