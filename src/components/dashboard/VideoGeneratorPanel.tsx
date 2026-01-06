import { motion } from "framer-motion";
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Image,
  Type,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import { useState } from "react";
import { useVideoGenerator, VideoConcept } from "@/hooks/useVideoGenerator";
import { VideoConceptCard } from "./VideoConceptCard";
import { useOnboardingStore } from "@/stores/onboarding-store";

export const VideoGeneratorPanel = () => {
  const [inputType, setInputType] = useState<"image" | "text">("text");
  const [textPrompt, setTextPrompt] = useState("");
  const { isGenerating, concepts, error, generateConcepts, clearConcepts } = useVideoGenerator();
  const { data, isCompleted } = useOnboardingStore();

  const handleGenerate = () => {
    if (inputType === "text" && !textPrompt.trim()) {
      return;
    }
    generateConcepts(textPrompt, inputType);
  };

  const hasOnboardingData = isCompleted && data.businessDNA.brandName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg">AI Video Generator</h3>
          <p className="text-muted-foreground text-sm">Create viral ads in seconds</p>
        </div>
        {hasOnboardingData && (
          <div className="px-2 py-1 rounded-full bg-success/10 border border-success/20">
            <span className="text-[10px] font-medium text-success">
              Brand: {data.businessDNA.brandName}
            </span>
          </div>
        )}
      </div>

      {/* Warning if no onboarding data */}
      {!hasOnboardingData && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4">
          <AlertCircle className="w-4 h-4 text-warning" />
          <span className="text-xs text-warning">
            Complete onboarding for personalized video concepts
          </span>
        </div>
      )}

      {/* Input Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputType("image")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputType === "image"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Image className="w-4 h-4" />
          Product Image
        </button>
        <button
          onClick={() => setInputType("text")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputType === "text"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Type className="w-4 h-4" />
          Text Prompt
        </button>
      </div>

      {/* Upload Area */}
      {inputType === "image" ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-medium mb-1">Drop product images here</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="Add optional context about the product..."
            className="w-full mt-4 h-20 bg-secondary/50 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="Describe your ideal video ad... e.g., 'A UGC-style video showcasing our wireless earbuds with a morning routine hook, targeting Gen Z'"
            className="w-full h-32 bg-secondary/50 border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || (inputType === "text" && !textPrompt.trim())}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Viral Concepts...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate 5 Viral Concepts
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      {/* Generated Concepts */}
      {concepts.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Generated Concepts</span>
            <button
              onClick={clearConcepts}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid gap-4">
            {concepts.map((concept, index) => (
              <VideoConceptCard key={concept.id} concept={concept} index={index} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
