import React, { useState, useRef, useCallback } from 'react';
import type { AnalysisResult } from '../types';

interface ResultDisplayProps {
  imageUrl: string;
  result: AnalysisResult;
  onReset: () => void;
}

const HealthStatus: React.FC<{ isHealthy: boolean }> = ({ isHealthy }) => {
    const baseClasses = "px-4 py-1 text-sm font-semibold rounded-full inline-block";
    if (isHealthy) {
        return <span className={`${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`}>Appears Healthy</span>
    }
    return <span className={`${baseClasses} bg-amber-500/20 text-amber-300 border border-amber-500/30`}>Potential Issues Detected</span>
}

const ConfidenceScore: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 16; // 2 * pi * r
    const offset = circumference - (score / 100) * circumference;

    let color = 'text-red-400';
    if (score >= 90) {
        color = 'text-green-400';
    } else if (score >= 70) {
        color = 'text-yellow-400';
    }

    return (
        <div className="relative h-20 w-20" title={`AI Confidence: ${score}%`}>
            <svg className="transform -rotate-90" width="80" height="80">
                <circle cx="40" cy="40" r="34" strokeWidth="6" stroke="currentColor" className="text-slate-700" fill="transparent" />
                <circle
                    cx="40" cy="40" r="34" strokeWidth="6"
                    stroke="currentColor" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-500 ease-in-out`}
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${color}`}>
                {score}%
            </span>
        </div>
    );
};


const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.182m0-4.991v4.99" />
    </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, result, onReset }) => {
  const [hoveredSymptom, setHoveredSymptom] = useState<number | null>(null);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const MAGNIFIER_SIZE = 150;
  const ZOOM_LEVEL = 2.5;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMagnifierPosition({ x, y });
  }, []);

  const renderCard = (title: string, content: React.ReactNode, icon?: React.ReactNode) => (
    <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700/50">
        <h3 className="font-semibold text-lg text-slate-300 flex items-center gap-2 mb-2">
            {icon}
            {title}
        </h3>
        <div className="text-slate-400 text-sm">{content}</div>
    </div>
  );

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 shadow-2xl animate-fade-in-up border border-slate-700/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Image with Bounding Boxes */}
        <div 
            ref={imageContainerRef}
            className="md:col-span-3 relative w-full aspect-square rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg cursor-crosshair"
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            onMouseMove={handleMouseMove}
        >
          <img src={imageUrl} alt="Analyzed eye" className="w-full h-full object-cover" />
          
           {showMagnifier && imageContainerRef.current && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${magnifierPosition.x - MAGNIFIER_SIZE / 2}px`,
                        top: `${magnifierPosition.y - MAGNIFIER_SIZE / 2}px`,
                        height: `${MAGNIFIER_SIZE}px`,
                        width: `${MAGNIFIER_SIZE}px`,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: `-${(magnifierPosition.x * ZOOM_LEVEL) - MAGNIFIER_SIZE / 2}px -${(magnifierPosition.y * ZOOM_LEVEL) - MAGNIFIER_SIZE / 2}px`,
                        backgroundSize: `${imageContainerRef.current.clientWidth * ZOOM_LEVEL}px ${imageContainerRef.current.clientHeight * ZOOM_LEVEL}px`,
                        backgroundRepeat: 'no-repeat',
                        border: '3px solid #06b6d4',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                        zIndex: 50,
                    }}
                />
           )}

          {result.symptoms.map((symptom, index) => {
            const isHovered = hoveredSymptom === index;
            return (
                <div
                key={index}
                className={`group absolute transition-all duration-300 ${isHovered ? 'bg-cyan-400/30' : 'bg-cyan-400/10'} border-2 ${isHovered ? 'border-cyan-300 animate-pulse-bright' : 'border-cyan-400/50'}`}
                style={{
                    left: `${symptom.boundingBox.x}%`,
                    top: `${symptom.boundingBox.y}%`,
                    width: `${symptom.boundingBox.width}%`,
                    height: `${symptom.boundingBox.height}%`,
                }}
                onMouseEnter={() => setHoveredSymptom(index)}
                onMouseLeave={() => setHoveredSymptom(null)}
                >
                    <div className={`absolute -top-3 -left-3 h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold text-white transition-all ${isHovered ? 'bg-cyan-300 scale-110 text-slate-900' : 'bg-cyan-500'}`}>
                        {index + 1}
                    </div>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        {symptom.name}
                     </div>
                </div>
            )
          })}
        </div>

        {/* Analysis Details */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/70 rounded-lg border border-slate-700/50">
             <div>
                <h2 className="text-xl font-bold text-cyan-300">Analysis Report</h2>
                <HealthStatus isHealthy={result.isHealthy} />
             </div>
             <ConfidenceScore score={result.confidenceScore} />
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {renderCard("Primary Diagnosis", <p className="font-bold text-slate-200 text-base">{result.primaryDiagnosis}</p>)}
            {renderCard("Summary", <p>{result.summary}</p>)}

            {!result.isHealthy && result.differentialDiagnoses && result.differentialDiagnoses.length > 0 && (
                renderCard("Other Possibilities", 
                    <ul className="space-y-3">
                        {result.differentialDiagnoses.map((diag, index) => (
                            <li key={index}>
                                <p className="font-semibold text-slate-300">{diag.name}</p>
                                <p className="text-xs text-slate-400 italic">"{diag.reasoning}"</p>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {!result.isHealthy && result.symptoms.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-lg text-slate-300 mb-2">Detected Symptoms</h3>
                    <ul className="space-y-2">
                        {result.symptoms.map((symptom, index) => {
                             const isHovered = hoveredSymptom === index;
                             return (
                                <li key={index} 
                                    className={`p-3 rounded-md transition-all duration-200 cursor-pointer border ${isHovered ? 'bg-slate-700/80 border-slate-600' : 'bg-slate-800/70 border-slate-700/50'}`}
                                    onMouseEnter={() => setHoveredSymptom(index)}
                                    onMouseLeave={() => setHoveredSymptom(null)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-bold text-cyan-400 flex items-center gap-2">
                                            <span className={`h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs rounded-full transition-colors ${isHovered ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-cyan-400'}`}>{index + 1}</span>
                                            {symptom.name}
                                        </p>
                                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">{symptom.anatomicalLayer}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 pl-7 mt-1">{symptom.description}</p>
                                </li>
                            )
                        })}
                    </ul>
                 </div>
            )}
            
            {!result.isHealthy && result.possibleSymptoms && result.possibleSymptoms.length > 0 && (
                renderCard("Possible Associated Symptoms",
                    <ul className="list-disc list-inside space-y-1">
                        {result.possibleSymptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                        ))}
                    </ul>
                )
            )}

            {!result.isHealthy && result.treatment && result.treatment !== 'N/A' && (
                renderCard("Potential Treatment Info", <p>{result.treatment}</p>, <InfoIcon className="h-5 w-5" />)
            )}
            
            <div className="bg-amber-900/40 p-4 rounded-lg border border-amber-500/30">
                <h3 className="font-semibold text-lg text-amber-300 flex items-center gap-2">
                    <WarningIcon className="h-5 w-5" />
                    Important: Next Steps
                </h3>
                <p className="text-amber-300/90 text-sm mt-2">{result.nextSteps}</p>
            </div>
          </div>

        </div>
      </div>
      <div className="mt-8 text-center">
        <button 
            onClick={onReset} 
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transform hover:-translate-y-0.5">
            <ResetIcon className="h-5 w-5" />
            Analyze Another Image
        </button>
      </div>
    </div>
  );
};