import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, ShieldCheck, Database, Globe, Layers, Zap, Hexagon, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pageConfig: Record<string, { title: string; description: string; icon: any; status: string; features: string[] }> = {
  "methodology": {
    title: "Diagnostic methodology",
    description: "Deep dive into the frameworks and approaches powering our consultancy assessment engines.",
    icon: Hexagon,
    status: "Framework update active",
    features: ["Strategic analysis", "Performance mapping", "Data insights"]
  },
  "case-studies": {
    title: "Global case studies",
    description: "Real-world impact metrics from leading organizations utilizing our strategic consultancy models.",
    icon: Globe,
    status: "Compiling recent data",
    features: ["Enterprise scaling", "Market diagnostics", "Growth optimization"]
  },
  "global-benchmarks": {
    title: "Global industry benchmarks",
    description: "Calibrate your progress against aggregated global intelligence and industry-leading metrics.",
    icon: Database,
    status: "Index compiling",
    features: ["Real-time aggregation", "Sector filtering", "Progress ranking"]
  },
  "pricing": {
    title: "Session pricing",
    description: "Transparent and scalable pricing for individuals and professional organizations.",
    icon: Layers,
    status: "New tiers available",
    features: ["Strategy sessions", "Review cycles", "Mock interviews"]
  },
  "user-guide": {
    title: "Systems interface guide",
    description: "Comprehensive documentation for booking, preparing, and analyzing your session data.",
    icon: TerminalSquare,
    status: "Documentation sync active",
    features: ["Client handbook", "Preparation FAQ", "Process guide"]
  },
  "developer-api": {
    title: "Developer API & Integrations",
    description: "Connect your enterprise applications directly to our REST and WebSocket event streams.",
    icon: Cpu,
    status: "API v2 Beta",
    features: ["OAuth 2.0 Auth", "Webhooks", "Custom Endpoints"]
  },
  "system-logs": {
    title: "Infrastructure Logs",
    description: "Real-time security auditing and operational system updates from the engineering core.",
    icon: Zap,
    status: "All Systems Operational",
    features: ["Incident Reports", "Latency Checks", "Update Changelog"]
  },
  "whitepapers": {
    title: "Research and whitepapers",
    description: "Peer-reviewed analysis and forward-looking studies on career growth and admissions science.",
    icon: ShieldCheck,
    status: "Research active",
    features: ["Admissions success", "Career trajectories", "Scholarship research"]
  },
  "community": {
    title: "Architect Community",
    description: "Connect with thousands of culture strategists, HR leaders, and organizational psychologists.",
    icon: Globe,
    status: "Forum Expanding",
    features: ["Strategy Boards", "Template Sharing", "Live Q&A"]
  }
};

export default async function DynamicFooterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = pageConfig[slug];

  // If the slug isn't one of our known generic marketing pages, throw a 404
  // so we don't accidentally swallow actual missing application routes.
  if (!config) {
    notFound();
  }

  const { title, description, icon: Icon, status, features } = config;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center pt-24 pb-20">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 w-full mt-10">
        <div className="mb-10 animate-fade-in text-center sm:text-left flex flex-col items-center sm:items-start">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] flex items-center justify-center mb-8 shadow-sm">
                <Icon size={36} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{status}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl text-slate-900 dark:text-white mb-8 leading-tight">
                {title.split(' ').map((word, i, arr) => 
                   i === arr.length - 1 ? <span key={i} className="text-primary block sm:inline">{word}</span> : <span key={i}>{word} </span>
                )}
            </h1>
            <p className="text-lg lg:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-12">
                {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mb-16 w-full">
                {features.map((feature, i) => (
                    <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shrink-0 group hover:border-primary/30 transition-all text-center">
                        <span className="text-xs text-primary font-bold group-hover:text-primary transition-colors">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <Link href="/">
                    <Button className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-white text-[13px] font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 w-full sm:w-auto">
                        <ArrowLeft size={18} /> Return home
                    </Button>
                </Link>
                <p className="text-xs font-bold text-slate-400">Environment deploying soon.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
