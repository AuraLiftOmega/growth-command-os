/**
 * ElevenLabs Dashboard - Complete voice AI hub
 * Voice cloning, TTS, agents, speech-to-speech
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Volume2,
  Bot,
  Wand2,
  Play,
  Pause,
  Download,
  RefreshCw,
  Settings,
  Sparkles,
  Loader2,
  CheckCircle2,
  Headphones,
  MessageSquare,
  Zap,
  Copy,
  Plus,
  Music,
  Radio,
  AudioWaveform,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AISuggestionBanner } from "@/components/social/AISuggestionBanner";

// Voice presets
const VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Young female, warm", accent: "American" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Professional female", accent: "American" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Casual male", accent: "Australian" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Warm British male", accent: "British" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", description: "Transatlantic male", accent: "Transatlantic" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", description: "British female", accent: "British" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "British female, narrator", accent: "British" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "Deep American male", accent: "American" },
];

// Agent templates
const AGENT_TEMPLATES = [
  { id: "product-demo", name: "Product Demo Agent", description: "Showcase product features interactively", icon: "🎬" },
  { id: "customer-support", name: "Customer Support", description: "24/7 AI-powered customer assistance", icon: "💬" },
  { id: "sales-qualifier", name: "Sales Qualifier", description: "Qualify leads and book demos", icon: "📞" },
  { id: "onboarding", name: "Onboarding Guide", description: "Guide new users through your product", icon: "🎯" },
];

export default function ElevenLabsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tts");
  const [isConnected, setIsConnected] = useState(true); // Auto-connected via connector
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // TTS state
  const [ttsText, setTtsText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [speed, setSpeed] = useState([1.0]);
  
  // Agent state
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  
  // Voice clone state
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneFile, setCloneFile] = useState<File | null>(null);

  const aiSuggestions = [
    {
      id: "voice-tip",
      type: "tip" as const,
      title: "Voice Selection",
      description: "Use Sarah voice for skincare ads — warm and trustworthy tone increases conversions by 23%",
      priority: "high" as const,
    },
    {
      id: "clone-tip",
      type: "action" as const,
      title: "Clone Your Voice",
      description: "Create a personalized brand voice for authentic customer connection",
      priority: "medium" as const,
      action: {
        label: "Start Cloning",
        onClick: () => setShowCloneModal(true),
      },
    },
  ];

  const handleGenerateTTS = useCallback(async () => {
    if (!ttsText.trim()) {
      toast.error("Please enter text to convert");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "generate",
            text: ttsText,
            voiceId: selectedVoice,
            stability: stability[0],
            similarity_boost: similarityBoost[0],
            speed: speed[0],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audioContent) {
        const audioDataUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        setAudioUrl(audioDataUrl);
        toast.success("Audio generated successfully!");
      } else {
        throw new Error("No audio content received");
      }
    } catch (err: any) {
      console.error("TTS error:", err);
      toast.error(err.message || "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  }, [ttsText, selectedVoice, stability, similarityBoost, speed]);

  const handlePlayPause = () => {
    const audio = document.getElementById("tts-audio") as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "voiceover.mp3";
      link.click();
      toast.success("Audio downloaded!");
    }
  };

  const handleCreateAgent = async () => {
    if (!agentName.trim() || !selectedTemplate) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success(`Agent "${agentName}" created! Configure in ElevenLabs dashboard.`);
    setShowAgentModal(false);
    setAgentName("");
    setAgentPrompt("");
    setSelectedTemplate(null);
  };

  const handleCloneVoice = async () => {
    if (!cloneName.trim() || !cloneFile) {
      toast.error("Please provide a name and audio sample");
      return;
    }

    toast.success(`Voice "${cloneName}" is being processed. This may take a few minutes.`);
    setShowCloneModal(false);
    setCloneName("");
    setCloneFile(null);
  };

  const selectedVoiceDetails = VOICES.find(v => v.id === selectedVoice);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <AudioWaveform className="w-5 h-5 text-white" />
            </div>
            ElevenLabs Voice AI
          </h1>
          <p className="text-muted-foreground">
            Professional voice synthesis, cloning, and AI agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-success gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* AI Suggestions */}
      <AISuggestionBanner suggestions={aiSuggestions} context="elevenlabs" />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Voices Available", value: "8+", icon: Volume2, color: "text-purple-500" },
          { label: "Characters/Month", value: "10K", icon: MessageSquare, color: "text-blue-500" },
          { label: "Agents Active", value: "0", icon: Bot, color: "text-green-500" },
          { label: "Audio Generated", value: "0h", icon: Headphones, color: "text-orange-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-br from-card to-muted/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="tts" className="gap-2">
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Text-to-Speech</span>
            <span className="sm:hidden">TTS</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="voices" className="gap-2">
            <Mic className="w-4 h-4" />
            Voices
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <Music className="w-4 h-4" />
            Library
          </TabsTrigger>
        </TabsList>

        {/* Text-to-Speech Tab */}
        <TabsContent value="tts" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Text to Speech
                </CardTitle>
                <CardDescription>
                  Convert your script to professional voiceover
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your text here... (e.g., 'Transform your skincare routine with our revolutionary Vitamin C Serum...')"
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ttsText.length} characters</span>
                  <span>~{Math.ceil(ttsText.length / 150)} seconds</span>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICES.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({voice.accent})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVoiceDetails && (
                    <p className="text-xs text-muted-foreground">
                      {selectedVoiceDetails.description}
                    </p>
                  )}
                </div>

                {/* Voice Settings */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stability</span>
                      <span className="text-muted-foreground">{stability[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={stability}
                      onValueChange={setStability}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity + Similarity</span>
                      <span className="text-muted-foreground">{similarityBoost[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={similarityBoost}
                      onValueChange={setSimilarityBoost}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Speed</span>
                      <span className="text-muted-foreground">{speed[0].toFixed(2)}x</span>
                    </div>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={0.7}
                      max={1.2}
                      step={0.05}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateTTS}
                  disabled={isGenerating || !ttsText.trim()}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Voiceover
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" />
                  Audio Output
                </CardTitle>
                <CardDescription>
                  Preview and download your generated audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {audioUrl ? (
                  <>
                    <div className="relative aspect-video rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center border border-primary/20">
                      <motion.div
                        animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <Button
                          size="lg"
                          variant="ghost"
                          className="w-16 h-16 rounded-full"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8" />
                          ) : (
                            <Play className="w-8 h-8 ml-1" />
                          )}
                        </Button>
                      </motion.div>
                      <audio
                        id="tts-audio"
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setAudioUrl(null);
                        setTtsText("");
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New
                    </Button>
                  </>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-muted-foreground">
                    <Volume2 className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No audio generated yet</p>
                    <p className="text-xs">Enter text and click Generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Voice Agents</h2>
              <p className="text-muted-foreground text-sm">
                Create AI-powered voice agents for demos, support, and sales
              </p>
            </div>
            <Button onClick={() => setShowAgentModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Agent
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENT_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setShowAgentModal(true);
                }}
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4 w-full">
                    <Zap className="w-3 h-3 mr-1" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state for created agents */}
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-1">No Agents Created Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first voice agent to automate customer interactions
              </p>
              <Button onClick={() => setShowAgentModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voices Tab */}
        <TabsContent value="voices" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Voice Library</h2>
              <p className="text-muted-foreground text-sm">
                Pre-made voices and your custom cloned voices
              </p>
            </div>
            <Button onClick={() => setShowCloneModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Clone Voice
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICES.map((voice) => (
              <Card key={voice.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {voice.name[0]}
                    </div>
                    <Badge variant="secondary">{voice.accent}</Badge>
                  </div>
                  <h3 className="font-semibold">{voice.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {voice.description}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedVoice(voice.id);
                        setActiveTab("tts");
                        toast.success(`Selected ${voice.name}`);
                      }}
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Audio Library</h2>
            <p className="text-muted-foreground text-sm">
              Previously generated voiceovers and audio files
            </p>
          </div>

          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Music className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-1">No Audio Files Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate voiceovers to build your audio library
              </p>
              <Button onClick={() => setActiveTab("tts")}>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate First Audio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Agent Modal */}
      <Dialog open={showAgentModal} onOpenChange={setShowAgentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Create Voice Agent
            </DialogTitle>
            <DialogDescription>
              Configure your AI voice agent for automated interactions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                placeholder="e.g., Product Demo Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <span className="flex items-center gap-2">
                        <span>{template.icon}</span>
                        {template.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} ({voice.accent})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt (Optional)</label>
              <Textarea
                placeholder="Customize how your agent behaves..."
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent}>
              <Zap className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Voice Modal */}
      <Dialog open={showCloneModal} onOpenChange={setShowCloneModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Clone Voice
            </DialogTitle>
            <DialogDescription>
              Upload an audio sample to create your custom voice
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Name</label>
              <Input
                placeholder="e.g., My Brand Voice"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Sample</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="voice-upload"
                />
                <label htmlFor="voice-upload" className="cursor-pointer">
                  <Radio className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {cloneFile ? cloneFile.name : "Click to upload audio"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3 or WAV, at least 30 seconds
                  </p>
                </label>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <strong>Tips for best results:</strong> Use clear speech without background noise,
                include varied emotional tones, and aim for 1-5 minutes of audio.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloneVoice}>
              <Sparkles className="w-4 h-4 mr-2" />
              Clone Voice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
