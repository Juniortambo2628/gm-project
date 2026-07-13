"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Mail,
  Calendar,
  Wifi,
  Cloud,
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Zap,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminListPage } from "@/components/admin/AdminListPage";
import {
  getIntegrationTests,
  runIntegrationTest,
  runAllIntegrationTests,
  sendTestEmail,
  type IntegrationTestResult,
  getErrorMessage,
} from "@/lib/api";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  paystack: CreditCard,
  smtp: Mail,
  calendly: Calendar,
  reverb: Wifi,
  s3: Cloud,
  backend_api: Server,
  google_fonts: Globe,
};

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  ok: {
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
  warning: {
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
  },
  error: {
    color: "text-red-600",
    bg: "bg-red-500/10 border-red-500/20",
    icon: XCircle,
  },
  unknown: {
    color: "text-muted-foreground",
    bg: "bg-muted/10 border-muted/20",
    icon: HelpCircle,
  },
};

const templateOptions = [
  { value: "welcome", label: "Welcome Email" },
  { value: "forgot_password", label: "Forgot Password" },
  { value: "two_factor", label: "2FA Code" },
  { value: "payment_success", label: "Payment Success" },
  { value: "booking_success", label: "Booking Confirmation" },
  { value: "booking_reminder", label: "Booking Reminder" },
  { value: "meeting_followup", label: "Session Follow-Up" },
  { value: "inquiry_received", label: "Inquiry (Admin)" },
  { value: "inquiry_auto_reply", label: "Inquiry Auto-Reply" },
];

export default function IntegrationsPage() {
  const [results, setResults] = useState<IntegrationTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testEmailTemplate, setTestEmailTemplate] = useState("welcome");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getIntegrationTests();
      setResults(data);
    } catch (err) {
      toast.error("Failed to load integration statuses", { description: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setTestingAll(true);
    try {
      const data = await runAllIntegrationTests();
      setResults(data);
      toast.success("All integration tests completed");
    } catch (err) {
      toast.error("Failed to run tests", { description: getErrorMessage(err) });
    } finally {
      setTestingAll(false);
    }
  };

  const testOne = async (key: string) => {
    setTestingKey(key);
    try {
      const result = await runIntegrationTest(key);
      setResults((prev) => prev.map((r) => (r.key === key ? result : r)));
      toast.success(`${result.name} test completed`);
    } catch (err) {
      toast.error("Test failed", { description: getErrorMessage(err) });
    } finally {
      setTestingKey(null);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error("Please enter an email address");
      return;
    }
    setSendingTestEmail(true);
    try {
      const result = await sendTestEmail(testEmailAddress, testEmailTemplate);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to send test email", { description: getErrorMessage(err) });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const okCount = results.filter((r) => r.status === "ok").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const total = results.length;

  return (
    <AdminListPage
      title="API Integrations"
      description="Verify connectivity for all external services configured in this application."
      isLoading={loading}
    >
      <div className="space-y-8">
        {/* Summary Banner */}
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          <Card className="flex-1 rounded-2xl border shadow-sm p-6 bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integration Health</p>
                <p className="text-3xl font-black text-foreground">
                  {okCount}/{total}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${errorCount > 0 ? "bg-red-500/10" : warningCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                {errorCount > 0 ? (
                  <XCircle size={28} className="text-red-500" />
                ) : warningCount > 0 ? (
                  <AlertTriangle size={28} className="text-amber-500" />
                ) : (
                  <CheckCircle2 size={28} className="text-emerald-500" />
                )}
              </div>
            </div>
            <div className="flex gap-6 mt-4 text-xs font-bold">
              <span className="text-emerald-600">{okCount} healthy</span>
              <span className="text-amber-600">{warningCount} warnings</span>
              <span className="text-red-600">{errorCount} errors</span>
            </div>
          </Card>

          <Card className="rounded-2xl border shadow-sm p-6 bg-card flex items-center">
            <Button onClick={testAll} disabled={testingAll} className="rounded-2xl h-14 px-8 font-black">
              {testingAll ? (
                <RefreshCcw className="animate-spin mr-2" size={20} />
              ) : (
                <Zap size={20} className="mr-2" />
              )}
              {testingAll ? "Running Tests..." : "Test All Integrations"}
            </Button>
          </Card>
        </div>

        {/* Send Test Email Section */}
        <Card className="rounded-2xl border shadow-sm p-6 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
              <Send size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Send Test Email</h3>
              <p className="text-xs text-muted-foreground font-medium">Verify email delivery by sending a sample template to any address.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="flex-1 h-12 rounded-xl bg-secondary/50 border-none font-medium"
            />
            <select
              value={testEmailTemplate}
              onChange={(e) => setTestEmailTemplate(e.target.value)}
              className="h-12 px-4 rounded-xl bg-secondary/50 border-none font-medium text-sm outline-none min-w-[200px]"
            >
              {templateOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail || !testEmailAddress}
              className="rounded-xl h-12 px-6 font-bold"
            >
              {sendingTestEmail ? (
                <RefreshCcw className="animate-spin mr-2" size={16} />
              ) : (
                <Send size={16} className="mr-2" />
              )}
              {sendingTestEmail ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </Card>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 gap-4">
          {results.map((result) => {
            const Icon = iconMap[result.key] || Globe;
            const config = statusConfig[result.status] || statusConfig.unknown;
            const isExpanded = expandedKey === result.key;

            return (
              <Card
                key={result.key}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all bg-card ${
                  result.status === "error"
                    ? "border-red-500/20"
                    : result.status === "warning"
                    ? "border-amber-500/20"
                    : "border-border"
                }`}
              >
                {/* Main Row */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                      <Icon size={22} className={config.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-foreground truncate">{result.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${config.bg} ${config.color}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedKey(isExpanded ? null : result.key)}
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                    <Button
                      onClick={() => testOne(result.key)}
                      disabled={testingKey === result.key}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold"
                    >
                      {testingKey === result.key ? (
                        <RefreshCcw className="animate-spin" size={14} />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-muted-foreground">Configured:</span>
                          <span className={result.configured ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                            {result.configured ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-muted-foreground">Connected:</span>
                          <span className={result.connected ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                            {result.connected ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-muted-foreground">Last tested:</span>
                          <span className="text-foreground font-medium">
                            {result.tested_at ? new Date(result.tested_at).toLocaleString() : "Never"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</p>
                        <div className="bg-card border rounded-xl p-3 space-y-1.5">
                          {Object.entries(result.details || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">{key.replace(/_/g, " ")}</span>
                              <span className="font-bold text-foreground truncate ml-4 max-w-[200px]">
                                {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">About Integration Testing</p>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Each integration is tested by checking configuration and attempting a real connection.
            Errors indicate missing .env values. Warnings suggest partial configuration or services running in development mode.
            Run all tests after updating environment variables to verify connectivity.
          </p>
        </div>
      </div>
    </AdminListPage>
  );
}
