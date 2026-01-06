import { motion } from "framer-motion";
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Image,
  Type,
  Loader2,
  AlertCircle,
  X,
  ImageIcon,
  Trash2
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useVideoGenerator } from "@/hooks/useVideoGenerator";
import { VideoConceptCard } from "./VideoConceptCard";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ProductAnalysisCard } from "./ProductAnalysisCard";

export const VideoGeneratorPanel = () => {
  const [inputType, setInputType] = useState<"image" | "text">("text");
  const [textPrompt, setTextPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isGenerating, concepts, productAnalysis, error, generateConcepts, clearConcepts } = useVideoGenerator();
  const { data, isCompleted } = useOnboardingStore();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleGenerate = () => {
    if (inputType === "text" && !textPrompt.trim()) {
      return;
    }
    if (inputType === "image" && !uploadedImage) {
      return;
    }
    generateConcepts(textPrompt, inputType, uploadedImage || undefined);
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      {inputType === "image" ? (
        <div className="mb-6">
          {uploadedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={uploadedImage}
                alt="Uploaded product"
                className="w-full h-48 object-contain bg-secondary/30"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-success/20 border border-success/30">
                <span className="text-[10px] font-medium text-success flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Image ready for analysis
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors ${
                isDragging ? "bg-primary/20" : "bg-secondary group-hover:bg-primary/10"
              }`}>
                <Upload className={`w-6 h-6 transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                }`} />
              </div>
              <p className="text-sm font-medium mb-1">
                {isDragging ? "Drop image here" : "Drop product images here"}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
          )}
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
        disabled={isGenerating || (inputType === "text" && !textPrompt.trim()) || (inputType === "image" && !uploadedImage)}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {inputType === "image" ? "Analyzing Image & Generating..." : "Generating Viral Concepts..."}
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

      {/* Product Analysis */}
      {productAnalysis && <ProductAnalysisCard analysis={productAnalysis} />}

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