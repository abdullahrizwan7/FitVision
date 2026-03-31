import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, ChevronRight, HelpCircle, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type FaqItem = {
  question: string;
  answer: string;
  whyItMatters: string;
};

const faqLibrary: Record<string, FaqItem[]> = {
  global: [
    {
      question: 'What is FitVision?',
      answer:
        'FitVision is an AI-assisted workout tracker that combines camera-based exercise sessions, rep counting, form feedback, progress views, and a workout library in one app.'
      ,
      whyItMatters:
        'This matters because most basic fitness apps only log workouts after they happen. FitVision tries to support the user during the workout itself with live guidance and structure.'
    },
    {
      question: 'Do I need to sign in?',
      answer:
        'You can browse much of the app without signing in, but signing in is needed for personalized history, saved workout data, dashboard insights, and profile-based features.'
      ,
      whyItMatters:
        'This matters because the app becomes much more useful when it can remember progress over time. Sign-in turns the experience from a demo into a personal training log.'
    },
    {
      question: 'Why does camera framing matter?',
      answer:
        'The workout detector needs your body visible enough to identify movement cleanly. Better framing improves readiness, form scoring, and rep accuracy.'
      ,
      whyItMatters:
        'This matters because poor framing leads to weaker movement detection. If the system cannot see the full range of motion, it cannot give reliable rep counts or form feedback.'
    },
    {
      question: 'What makes FitVision different from a normal fitness app?',
      answer:
        'FitVision focuses on what happens during the workout, not only after it. Instead of just logging a set manually, it tries to read body movement, count reps, and surface form-aware guidance while the exercise is happening.'
      ,
      whyItMatters:
        'This matters because it positions the project as an interactive fitness experience rather than just a tracker. That is one of the strongest innovation points when presenting the app.'
    },
    {
      question: 'Why include a workout library?',
      answer:
        'The workout library gives structure to the product. It helps users discover available exercises, understand categories and difficulty levels, and move into sessions with clearer expectations.'
      ,
      whyItMatters:
        'This matters because users need more than a camera screen. The library turns FitVision into a fuller product by connecting discovery, planning, and execution.'
    },
    {
      question: 'Why are progress and analytics important?',
      answer:
        'Progress screens show whether users are improving over time through totals, streaks, consistency, and form-related signals. They help translate individual workouts into long-term momentum.'
      ,
      whyItMatters:
        'This matters because people stay engaged when they can see results. Analytics turn isolated sessions into a story of improvement, which makes the app feel much more valuable.'
    },
    {
      question: 'Is FitVision meant for beginners or advanced users?',
      answer:
        'It can support both, but it is especially approachable for beginners because it provides structure, guided exercise choices, camera setup feedback, and clear progress surfaces.'
      ,
      whyItMatters:
        'This matters because beginner-friendly design broadens the audience. It also makes the project easier to demonstrate, since the product explains itself more clearly.'
    }
  ],
  '/dashboard': [
    {
      question: 'What does the dashboard show?',
      answer:
        'The dashboard highlights your recent sessions, training totals, average form score, current streak, and shortcuts into the workout session, analytics, and workout library.'
      ,
      whyItMatters:
        'This matters because users need one place to understand progress quickly. A strong dashboard reduces friction and helps people decide what to do next without hunting through the app.'
    },
    {
      question: 'How should I use the dashboard well?',
      answer:
        'Use it as your control panel: start a session quickly, check recent progress, and use the totals to notice trends in reps, time, calories, and form.'
      ,
      whyItMatters:
        'This matters because fitness products are more effective when the next action is obvious. The dashboard is designed to keep users moving rather than making them think too much.'
    },
    {
      question: 'Why are my stats missing?',
      answer:
        'If stats are empty, you may not be signed in yet or no workouts have been saved to your profile. Completing a session while signed in should start filling those sections.'
      ,
      whyItMatters:
        'This matters because missing stats can feel like the app is broken. Making this clear helps users understand that tracking depends on account state and saved sessions.'
    },
    {
      question: 'Why is the dashboard useful in a project demo?',
      answer:
        'The dashboard quickly proves that the app is more than a one-screen prototype. It shows saved data, training history, and user-facing insights in a way that feels like a complete product.'
      ,
      whyItMatters:
        'This matters because reviewers often look for continuity across features. A strong dashboard helps communicate product maturity and real user value.'
    },
    {
      question: 'What should an audience notice first on the dashboard?',
      answer:
        'They should notice the next action, the recent performance summary, and the way progress is visualized. Those three elements make the dashboard feel actionable instead of decorative.'
      ,
      whyItMatters:
        'This matters because good dashboards reduce cognitive load. They make it obvious what the app wants users to do and what they are improving.'
    }
  ],
  '/workout-library': [
    {
      question: 'How do I choose a workout?',
      answer:
        'Start with your goal first. Pick strength for bodyweight power, cardio for conditioning, core for stability, and flexibility for recovery or mobility work.'
      ,
      whyItMatters:
        'This matters because the library is more than a list. It is supposed to guide selection, helping different users quickly find something that matches their fitness goal.'
    },
    {
      question: 'Which workouts are AI-tracked?',
      answer:
        'The library highlights AI-supported exercises clearly. Those are the best starting point if you want live rep counting or pose-aware feedback during a session.'
      ,
      whyItMatters:
        'This matters because AI-tracked modes are the most showcase-worthy part of the product. They represent the core technical value of FitVision.'
    },
    {
      question: 'What is a good beginner routine?',
      answer:
        'A simple starter flow is push-ups, squats, plank, and jumping jacks with short targets. That gives a balanced mix of upper body, lower body, core, and cardio.'
      ,
      whyItMatters:
        'This matters because new users often need direction immediately. A beginner-friendly suggestion reduces hesitation and helps the app feel supportive from the first session.'
    },
    {
      question: 'Why show categories and difficulty in the library?',
      answer:
        'Categories and difficulty labels help users filter the library by intent. They turn a long list of workouts into a more understandable decision space.'
      ,
      whyItMatters:
        'This matters because discoverability is part of product quality. It is not enough to support many workouts if users cannot quickly understand what fits them.'
    },
    {
      question: 'Why does the library improve the showcase value of FitVision?',
      answer:
        'A larger workout library shows that the project can scale beyond one or two demo exercises. It demonstrates breadth, content planning, and a more complete fitness experience.'
      ,
      whyItMatters:
        'This matters because audiences often judge whether a prototype feels expandable. A richer library makes FitVision feel like a product platform, not a single-feature experiment.'
    }
  ],
  '/workout-session': [
    {
      question: 'How should I stand in the camera?',
      answer:
        'Make sure your full body is visible, your phone or laptop is stable, and the room has enough light. The system works best when your whole movement range stays inside frame.'
      ,
      whyItMatters:
        'This matters because the session screen is where trust is won or lost. If setup is unclear, users assume the AI is unreliable even when the real issue is camera positioning.'
    },
    {
      question: 'Why is the session not starting?',
      answer:
        'The session waits until readiness is high enough. That usually means you need better framing, clearer lighting, or a more stable body position before the countdown begins.'
      ,
      whyItMatters:
        'This matters because automatic start should feel smart, not confusing. Explaining readiness helps users understand that the app is validating conditions before tracking them.'
    },
    {
      question: 'What does form score mean?',
      answer:
        'Form score is an overall quality signal based on how consistently the system detects the expected movement pattern and body alignment during the workout.'
      ,
      whyItMatters:
        'This matters because raw rep counting alone is not enough to feel innovative. Form score helps communicate that FitVision is evaluating quality, not just quantity.'
    },
    {
      question: 'Why is readiness shown before the workout starts?',
      answer:
        'Readiness acts like a quick system check. It tells the user whether the app has enough visual confidence to start tracking movement well.'
      ,
      whyItMatters:
        'This matters because it reduces confusion and builds trust. Instead of silently failing, the app explains when setup conditions are not good enough yet.'
    },
    {
      question: 'Why is the workout session the most important screen?',
      answer:
        'The workout session is where the promise of the product is tested. If the live camera experience feels clear, responsive, and helpful, the whole app feels more believable.'
      ,
      whyItMatters:
        'This matters because the live session is the core innovation surface. It is where AI guidance, movement tracking, and real-time UX come together.'
    },
    {
      question: 'What should I say when presenting the workout session?',
      answer:
        'Explain that the session is designed to reduce setup friction, validate framing, track movement in real time, and turn each set into useful performance feedback.'
      ,
      whyItMatters:
        'This matters because demos are strongest when the audience understands the intention behind the UI, not just the buttons they see.'
    }
  ]
};

const AICoachDrawer: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const faqs = useMemo(() => {
    const routeFaqs = faqLibrary[location.pathname] || [];
    return [...routeFaqs, ...faqLibrary.global];
  }, [location.pathname]);

  const selectedFaq = faqs.find((item) => item.question === activeQuestion) || faqs[0];

  return (
    <>
      <button
        onClick={() => {
          setActiveQuestion(faqs[0]?.question || null);
          setIsOpen(true);
        }}
        className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
      >
        <HelpCircle className="h-5 w-5" />
        Help
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.aside
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] text-white shadow-2xl"
            >
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      FitVision help
                    </div>
                    <h2 className="mt-3 text-2xl font-black">Quick help & FAQ</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Helpful answers about workouts, camera setup, progress screens, and how to get better results from FitVision.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid flex-1 min-h-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="overflow-y-auto border-b border-white/10 px-4 py-4 md:border-b-0 md:border-r">
                  <div className="space-y-2">
                    {faqs.map((item) => (
                      <button
                        key={item.question}
                        onClick={() => setActiveQuestion(item.question)}
                        className={`w-full rounded-[1.2rem] border px-4 py-3 text-left text-sm transition ${
                          selectedFaq?.question === item.question
                            ? 'border-cyan-400/30 bg-cyan-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-medium leading-6">{item.question}</span>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto px-5 py-5">
                  {selectedFaq && (
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        <Brain className="h-3.5 w-3.5" />
                        Explained
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-white">{selectedFaq.question}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-300">{selectedFaq.answer}</p>
                      <div className="mt-4 rounded-[1.2rem] border border-cyan-400/15 bg-cyan-500/8 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Why It Matters</p>
                        <p className="mt-2 text-sm leading-7 text-slate-200">{selectedFaq.whyItMatters}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Project Showcase Tip</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      When presenting FitVision, explain both the user feature and the product value. For example: “This screen does not just count reps, it helps users trust the workout experience by showing readiness, form quality, and structured progress.”
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICoachDrawer;
