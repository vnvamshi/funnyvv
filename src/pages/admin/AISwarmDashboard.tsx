// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW AI SWARM DASHBOARD
// Monitor all 17 AI agents, their status, workflows, and communication
// Access at: http://localhost:1117/admin/swarm or /swarm
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

// Agent Types
interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  status: 'active' | 'idle' | 'working' | 'error' | 'learning';
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  lastAction: string;
  lastActionTime: Date;
  cpu: number;
  memory: number;
  connections: string[];
  currentTask?: string;
  logs: LogEntry[];
  workflow: WorkflowStep[];
  rules: string[];
  capabilities: string[];
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  agent?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

interface AgentCommunication {
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  type: 'request' | 'response' | 'broadcast' | 'learning';
}

// Agent Definitions
const AGENTS: Omit<AgentStatus, 'status' | 'progress' | 'tasksCompleted' | 'tasksTotal' | 'lastAction' | 'lastActionTime' | 'cpu' | 'memory' | 'logs' | 'currentTask'>[] = [
  {
    id: 'setup',
    name: 'Setup Agent',
    emoji: '⚙️',
    connections: ['deploy', 'ecom', 'finance'],
    workflow: [
      { id: 's1', name: 'Load Vault Credentials', status: 'completed' },
      { id: 's2', name: 'Login to APIs', status: 'completed' },
      { id: 's3', name: 'Configure Keys', status: 'running' },
      { id: 's4', name: 'Verify Connections', status: 'pending' },
    ],
    rules: [
      'Never store credentials in code',
      'Rotate API keys monthly',
      'Use environment variables',
      'Encrypt sensitive data at rest',
    ],
    capabilities: ['API Authentication', 'Key Management', 'Account Setup', 'Configuration'],
  },
  {
    id: 'render',
    name: 'Render Agent',
    emoji: '🎨',
    connections: ['ecom', 'voice', 'video'],
    workflow: [
      { id: 'r1', name: 'Receive Image/Upload', status: 'completed' },
      { id: 'r2', name: 'Upscale (Replicate)', status: 'completed' },
      { id: 'r3', name: 'Convert to 3D (Meshy)', status: 'running' },
      { id: 'r4', name: 'Store GLB in S3', status: 'pending' },
    ],
    rules: [
      'Max image size: 10MB',
      'Output format: GLB',
      'Retry failed renders 3x',
      'Cache rendered assets 30 days',
    ],
    capabilities: ['Image Upscaling', '3D Conversion', 'Avatar Generation', 'Asset Storage'],
  },
  {
    id: 'ecom',
    name: 'Ecom Agent',
    emoji: '🛒',
    connections: ['render', 'marketing', 'money-shark'],
    workflow: [
      { id: 'e1', name: 'Sync Affiliate Feeds', status: 'completed' },
      { id: 'e2', name: 'Tag Cookies', status: 'running' },
      { id: 'e3', name: 'Track Conversions', status: 'running' },
      { id: 'e4', name: 'Process Checkouts', status: 'pending' },
    ],
    rules: [
      'Refresh feeds every 4 hours',
      'Cookie duration: 30 days',
      'Log all affiliate clicks',
      'Validate commission rates daily',
    ],
    capabilities: ['Catalog Sync', 'Cookie Tracking', 'Checkout Processing', 'Revenue Tracking'],
  },
  {
    id: 'voice',
    name: 'Voice/Avatar Agent',
    emoji: '🗣️',
    connections: ['render', 'ecom', 'social'],
    workflow: [
      { id: 'v1', name: 'Listen for Commands', status: 'running' },
      { id: 'v2', name: 'Process Speech (Web Speech)', status: 'running' },
      { id: 'v3', name: 'Generate Response (GPT)', status: 'completed' },
      { id: 'v4', name: 'Speak (ElevenLabs)', status: 'completed' },
    ],
    rules: [
      'Response time < 2 seconds',
      'Support 10+ languages',
      'Fallback to text on voice failure',
      'Log all conversations',
    ],
    capabilities: ['Speech Recognition', 'Text-to-Speech', 'Multilingual', 'Avatar Animation'],
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    emoji: '📢',
    connections: ['ecom', 'social', 'growth'],
    workflow: [
      { id: 'm1', name: 'Generate Content (GPT)', status: 'completed' },
      { id: 'm2', name: 'Create Visuals (Midjourney)', status: 'running' },
      { id: 'm3', name: 'Schedule Posts', status: 'pending' },
      { id: 'm4', name: 'Send Email Campaigns', status: 'pending' },
    ],
    rules: [
      'Post 3x daily minimum',
      'A/B test all campaigns',
      'Personalize emails by segment',
      'Track engagement metrics',
    ],
    capabilities: ['Content Creation', 'Social Posting', 'Email Campaigns', 'Ad Management'],
  },
  {
    id: 'services',
    name: 'Services Agent',
    emoji: '🔧',
    connections: ['ecom', 'finance', 'mls'],
    workflow: [
      { id: 'sv1', name: 'Receive Service Request', status: 'completed' },
      { id: 'sv2', name: 'Match Pro (Angi/Thumbtack)', status: 'running' },
      { id: 'sv3', name: 'Schedule Appointment', status: 'pending' },
      { id: 'sv4', name: 'Process Payment Split', status: 'pending' },
    ],
    rules: [
      'Only use verified pros',
      'Take 10-20% platform fee',
      'Send reminders 24h before',
      'Follow up for reviews',
    ],
    capabilities: ['Service Matching', 'Booking', 'Payment Splitting', 'Review Collection'],
  },
  {
    id: 'mls',
    name: 'MLS Agent',
    emoji: '🏠',
    connections: ['services', 'render', 'voice'],
    workflow: [
      { id: 'ml1', name: 'Pull IDX Feeds', status: 'completed' },
      { id: 'ml2', name: 'Process Listings', status: 'running' },
      { id: 'ml3', name: 'Generate 3D Tours', status: 'pending' },
      { id: 'ml4', name: 'Track Agent Commissions', status: 'pending' },
    ],
    rules: [
      'Sync MLS every 15 minutes',
      'Validate agent licenses',
      'Generate tours within 24h',
      'Commission: 25% of agent fee',
    ],
    capabilities: ['MLS Integration', 'Listing Management', '3D Tours', 'Lead Distribution'],
  },
  {
    id: 'lending',
    name: 'Lending Agent',
    emoji: '💳',
    connections: ['finance', 'mls', 'services'],
    workflow: [
      { id: 'l1', name: 'Receive Loan Request', status: 'completed' },
      { id: 'l2', name: 'Run Credit Check (Upstart)', status: 'running' },
      { id: 'l3', name: 'Generate Offer', status: 'pending' },
      { id: 'l4', name: 'Process Disbursement', status: 'pending' },
    ],
    rules: [
      'APR range: 7-15%',
      'Max loan: $50,000',
      'KYC required for all',
      'Comply with TILA/RESPA',
    ],
    capabilities: ['Credit Scoring', 'Loan Processing', 'Risk Assessment', 'Compliance'],
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    emoji: '🏦',
    connections: ['lending', 'ecom', 'growth'],
    workflow: [
      { id: 'f1', name: 'Track All Revenue', status: 'running' },
      { id: 'f2', name: 'Process Bank Referrals', status: 'completed' },
      { id: 'f3', name: 'Manage Round-ups (Plaid)', status: 'running' },
      { id: 'f4', name: 'Generate Financial Reports', status: 'pending' },
    ],
    rules: [
      'Reconcile daily',
      'Alert on anomalies > 20%',
      'Diversify revenue streams',
      'Maintain 3-month runway',
    ],
    capabilities: ['Revenue Tracking', 'Bank Integrations', 'Financial Reporting', 'Cash Flow'],
  },
  {
    id: 'vendor-hunter',
    name: 'Vendor Hunter',
    emoji: '🎯',
    connections: ['ecom', 'marketing', 'growth'],
    workflow: [
      { id: 'vh1', name: 'Crawl Apollo/LinkedIn', status: 'running' },
      { id: 'vh2', name: 'Identify High-Value Targets', status: 'running' },
      { id: 'vh3', name: 'Send Cold Outreach', status: 'pending' },
      { id: 'vh4', name: 'Onboard New Vendors', status: 'pending' },
    ],
    rules: [
      'Target 50 vendors/week',
      'Focus on 5%+ commission',
      'Prioritize exclusive deals',
      'Follow up 3x max',
    ],
    capabilities: ['Lead Generation', 'Cold Outreach', 'Vendor Onboarding', 'Deal Negotiation'],
  },
  {
    id: 'money-shark',
    name: 'Money Shark',
    emoji: '🦈',
    connections: ['ecom', 'vendor-hunter', 'finance'],
    workflow: [
      { id: 'ms1', name: 'Crawl Competitor Prices', status: 'running' },
      { id: 'ms2', name: 'Analyze Commission Rates', status: 'completed' },
      { id: 'ms3', name: 'Optimize Product Mix', status: 'running' },
      { id: 'ms4', name: 'Negotiate Better Rates', status: 'pending' },
    ],
    rules: [
      'Beat competitors by 5%',
      'Prioritize high-margin items',
      'Drop <2% commission products',
      'Renegotiate quarterly',
    ],
    capabilities: ['Price Intelligence', 'Margin Optimization', 'Competitive Analysis', 'Rate Negotiation'],
  },
  {
    id: 'omni-channel',
    name: 'Omni-Channel',
    emoji: '📱',
    connections: ['voice', 'social', 'ecom'],
    workflow: [
      { id: 'o1', name: 'Setup Alexa Skill', status: 'pending' },
      { id: 'o2', name: 'Configure Google Home', status: 'pending' },
      { id: 'o3', name: 'Build TV App (Samsung/LG)', status: 'pending' },
      { id: 'o4', name: 'CarPlay Integration', status: 'pending' },
    ],
    rules: [
      'Consistent UX across channels',
      'Sync cart across devices',
      'Voice-first on smart devices',
      'Offline mode for mobile',
    ],
    capabilities: ['Smart Home Integration', 'TV Apps', 'CarPlay', 'Cross-device Sync'],
  },
  {
    id: 'social',
    name: 'Social Dopamine',
    emoji: '🎪',
    connections: ['marketing', 'voice', 'growth'],
    workflow: [
      { id: 'sd1', name: 'Create IG AR Filters', status: 'running' },
      { id: 'sd2', name: 'Schedule TikTok Lives', status: 'pending' },
      { id: 'sd3', name: 'Run Viral Campaigns', status: 'running' },
      { id: 'sd4', name: 'Manage Influencer Network', status: 'pending' },
    ],
    rules: [
      'Go viral or go home',
      'Engage within 1 hour',
      'UGC > branded content',
      'Reward sharing with credits',
    ],
    capabilities: ['AR Filters', 'Live Shopping', 'Influencer Management', 'Viral Campaigns'],
  },
  {
    id: 'sanity',
    name: 'Sanity Agent',
    emoji: '🔍',
    connections: ['setup', 'deploy', 'all'],
    workflow: [
      { id: 'sa1', name: 'Run Health Checks', status: 'running' },
      { id: 'sa2', name: 'Test All Flows', status: 'running' },
      { id: 'sa3', name: 'Monitor Errors', status: 'running' },
      { id: 'sa4', name: 'Alert on Failures', status: 'running' },
    ],
    rules: [
      'Check every 4 hours',
      'Alert within 5 minutes',
      'Auto-rollback on critical failure',
      'Log everything',
    ],
    capabilities: ['Health Monitoring', 'Flow Testing', 'Error Detection', 'Auto-recovery'],
  },
  {
    id: 'deploy',
    name: 'Deploy Agent',
    emoji: '🚀',
    connections: ['setup', 'sanity', 'growth'],
    workflow: [
      { id: 'd1', name: 'Git Push', status: 'completed' },
      { id: 'd2', name: 'Vercel Build', status: 'completed' },
      { id: 'd3', name: 'DNS Configuration', status: 'running' },
      { id: 'd4', name: 'SSL Certificate', status: 'completed' },
    ],
    rules: [
      'Zero-downtime deploys',
      'Rollback on build failure',
      'Test in staging first',
      'Notify on completion',
    ],
    capabilities: ['CI/CD', 'Domain Management', 'SSL Provisioning', 'Rollback'],
  },
  {
    id: 'video',
    name: 'Video Agent',
    emoji: '🎬',
    connections: ['render', 'marketing', 'social'],
    workflow: [
      { id: 'vi1', name: 'Generate Scripts (GPT)', status: 'completed' },
      { id: 'vi2', name: 'Create Avatar Video (Synthesia)', status: 'running' },
      { id: 'vi3', name: 'Edit & Add Effects', status: 'pending' },
      { id: 'vi4', name: 'Publish to Channels', status: 'pending' },
    ],
    rules: [
      'Videos < 60 seconds',
      'Captions always on',
      'Thumbnail A/B test',
      'Post at peak hours',
    ],
    capabilities: ['Video Generation', 'Avatar Videos', 'Editing', 'Multi-platform Publishing'],
  },
  {
    id: 'growth',
    name: 'Growth Agent',
    emoji: '📈',
    connections: ['marketing', 'finance', 'social'],
    workflow: [
      { id: 'g1', name: 'SEO Optimization', status: 'running' },
      { id: 'g2', name: 'Email Sequences (Klaviyo)', status: 'running' },
      { id: 'g3', name: 'Referral Programs', status: 'pending' },
      { id: 'g4', name: 'Carbon Upsells', status: 'pending' },
    ],
    rules: [
      'Target 10% MoM growth',
      'CAC < $20',
      'LTV/CAC > 3',
      'Retention > 40%',
    ],
    capabilities: ['SEO', 'Email Marketing', 'Referrals', 'Growth Hacking'],
  },
];

const AISwarmDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [communications, setCommunications] = useState<AgentCommunication[]>([]);
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'network' | 'logs'>('grid');
  const [systemHealth, setSystemHealth] = useState({ cpu: 45, memory: 62, uptime: '99.9%' });

  // Initialize agents with simulated status
  useEffect(() => {
    const initAgents: AgentStatus[] = AGENTS.map(agent => ({
      ...agent,
      status: ['active', 'working', 'idle'][Math.floor(Math.random() * 3)] as any,
      progress: Math.floor(Math.random() * 100),
      tasksCompleted: Math.floor(Math.random() * 50),
      tasksTotal: 50 + Math.floor(Math.random() * 50),
      lastAction: 'Processing...',
      lastActionTime: new Date(Date.now() - Math.random() * 3600000),
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 60) + 20,
      logs: [],
    }));
    setAgents(initAgents);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        progress: Math.min(100, agent.progress + Math.random() * 5),
        cpu: Math.floor(Math.random() * 80) + 10,
        memory: Math.floor(Math.random() * 60) + 20,
        tasksCompleted: agent.tasksCompleted + (Math.random() > 0.8 ? 1 : 0),
        lastActionTime: Math.random() > 0.9 ? new Date() : agent.lastActionTime,
      })));

      // Simulate agent communication
      if (Math.random() > 0.7) {
        const fromAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
        const toAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
        if (fromAgent.id !== toAgent.id) {
          setCommunications(prev => [...prev.slice(-50), {
            from: fromAgent.id,
            to: toAgent.id,
            message: `Data sync request from ${fromAgent.name}`,
            timestamp: new Date(),
            type: ['request', 'response', 'broadcast', 'learning'][Math.floor(Math.random() * 4)] as any,
          }]);
        }
      }

      // Add global log
      if (Math.random() > 0.8) {
        const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
        setGlobalLogs(prev => [...prev.slice(-100), {
          timestamp: new Date(),
          level: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          message: `${agent.name}: Task completed successfully`,
          agent: agent.id,
        }]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'working': return 'bg-blue-500 animate-pulse';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'learning': return 'bg-purple-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const avgProgress = agents.length ? agents.reduce((sum, a) => sum + a.progress, 0) / agents.length : 0;
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'working').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🤖</span>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                AI Swarm Dashboard
              </h1>
              <p className="text-gray-400 text-sm">17 Agents Working 24/7 for VistaView Empire</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['grid', 'network', 'logs'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    viewMode === mode ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            <div>
              <span className="text-gray-400 text-sm">Active Agents</span>
              <p className="text-2xl font-bold text-green-400">{activeAgents}/17</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Tasks Completed</span>
              <p className="text-2xl font-bold text-cyan-400">{totalTasks}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Avg Progress</span>
              <p className="text-2xl font-bold text-purple-400">{avgProgress.toFixed(0)}%</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">System Health</span>
              <p className="text-2xl font-bold text-green-400">{systemHealth.uptime}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-gray-400 text-sm">CPU</span>
              <p className="text-lg font-mono text-yellow-400">{systemHealth.cpu}%</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Memory</span>
              <p className="text-lg font-mono text-orange-400">{systemHealth.memory}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`bg-gray-900 rounded-xl p-4 border cursor-pointer transition-all hover:scale-105 ${
                    selectedAgent?.id === agent.id ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{agent.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(agent.status)} text-white`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">CPU</span>
                      <p className="text-sm font-mono text-yellow-400">{agent.cpu}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{agent.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tasks: {agent.tasksCompleted}/{agent.tasksTotal}</span>
                    <span className="text-gray-500">{new Date(agent.lastActionTime).toLocaleTimeString()}</span>
                  </div>

                  {/* Connections */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.connections.slice(0, 3).map((conn) => (
                      <span key={conn} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                        →{conn}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'logs' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 h-[600px] overflow-y-auto font-mono text-sm">
              <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-gray-900 py-2">System Logs</h3>
              {globalLogs.slice().reverse().map((log, i) => (
                <div key={i} className={`py-1 border-b border-gray-800/50 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  log.level === 'success' ? 'text-green-400' : 'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>
                  {log.agent && <span className="text-cyan-400"> [{log.agent}]</span>}
                  <span> {log.message}</span>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'network' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-[600px] relative">
              <h3 className="text-lg font-semibold mb-4">Agent Communication Network</h3>
              <div className="grid grid-cols-5 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${getStatusColor(agent.status)} flex items-center justify-center text-2xl`}>
                      {agent.emoji}
                    </div>
                    <span className="text-xs mt-1 text-center">{agent.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 max-h-[350px] overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Communications</h4>
                {communications.slice().reverse().slice(0, 20).map((comm, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 text-sm border-b border-gray-800/50">
                    <span className="text-cyan-400">{comm.from}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-purple-400">{comm.to}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      comm.type === 'request' ? 'bg-blue-900 text-blue-300' :
                      comm.type === 'response' ? 'bg-green-900 text-green-300' :
                      comm.type === 'learning' ? 'bg-purple-900 text-purple-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>{comm.type}</span>
                    <span className="text-gray-500 text-xs ml-auto">{comm.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Agent Detail Panel */}
        {selectedAgent && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{selectedAgent.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedAgent.status)}`}>
                  {selectedAgent.status}
                </span>
              </div>
            </div>

            {/* Workflow */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">WORKFLOW</h3>
              <div className="space-y-2">
                {selectedAgent.workflow.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step.status === 'completed' ? 'bg-green-600' :
                      step.status === 'running' ? 'bg-blue-600 animate-pulse' :
                      step.status === 'failed' ? 'bg-red-600' : 'bg-gray-700'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.status === 'running' ? '◉' : i + 1}
                    </div>
                    <span className={step.status === 'completed' ? 'text-gray-400' : 'text-white'}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">CAPABILITIES</h3>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.capabilities.map((cap) => (
                  <span key={cap} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded text-xs">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">RULES</h3>
              <ul className="space-y-1">
                {selectedAgent.rules.map((rule, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Connections */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">CONNECTIONS</h3>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.connections.map((conn) => (
                  <span key={conn} className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">
                    → {conn}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-cyan-400">{selectedAgent.tasksCompleted}</p>
                <p className="text-xs text-gray-400">Tasks Done</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{selectedAgent.progress.toFixed(0)}%</p>
                <p className="text-xs text-gray-400">Progress</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISwarmDashboard;
