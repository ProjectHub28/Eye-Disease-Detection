import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { analyzeEyeImage } from './services/geminiService';
import type { AnalysisResult } from './types';

const loadingMessages = [
  "Initializing AI model...",
  "Calibrating AI sensors...",
  "Analyzing image pixels...",
  "Examining retinal patterns...",
  "Cross-referencing medical data...",
  "Finalizing analysis report...",
];

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);


  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    try {
      const result = await analyzeEyeImage(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. The AI model may be overloaded or the image could not be processed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0),#0f172a_90%)]"></div>
      <div className="absolute top-0 left-0 h-96 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/40 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-4xl mx-auto z-10">
        <Header />

        <main className="mt-10">
          {!imageUrl && (
            <div className="animate-fade-in-up">
              <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg shadow-2xl animate-fade-in-up">
              <Spinner />
              <p className="mt-4 text-lg text-cyan-400 font-medium">{loadingMessage}</p>
              <p className="text-sm text-slate-400">This may take a few moments.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center animate-fade-in-up">
              <strong className="font-bold">An error occurred:</strong>
              <span className="block sm:inline ml-2">{error}</span>
              <button onClick={handleReset} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          )}

          {analysisResult && imageUrl && !isLoading && (
             <ResultDisplay imageUrl={imageUrl} result={analysisResult} onReset={handleReset} />
          )}
        </main>
        
        <footer className="mt-16 text-center text-xs text-slate-500">
            <p className="font-bold text-amber-400">Disclaimer:</p>
            <p>This AI-powered tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;