import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.46 7.46 0 01-1.543-.162m1.543.162a7.46 7.46 0 00-1.543-.162m0 0a7.46 7.46 0 01-1.543.162m1.543-.162a7.46 7.46 0 001.543.162M12 6.75a4.5 4.5 0 00-4.5 4.5v.75m6 .75v-.75a4.5 4.5 0 00-4.5-4.5M12 6.75h.008v.008H12V6.75z" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload, disabled]);
  
  const baseClasses = "relative group flex flex-col items-center justify-center w-full min-h-64 bg-slate-800/50 rounded-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1";
  const borderClasses = "border-2 border-dashed border-slate-700 group-hover:border-cyan-500";
  const ringClasses = "group-hover:ring-4 group-hover:ring-cyan-500/20";
  const draggingClasses = "scale-105 border-cyan-400 ring-4 ring-cyan-500/30";
  const disabledClasses = "bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed transform-none";

  return (
    <div className="flex items-center justify-center w-full p-4">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <label
            htmlFor="dropzone-file"
            className={`${baseClasses} ${disabled ? disabledClasses : `${borderClasses} ${ringClasses} ${isDragging ? draggingClasses : ''}`} lg:w-1/2`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="absolute inset-0 bg-grid-slate-700/40 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10">
            <div className="p-4 bg-slate-700/50 rounded-full mb-4 border border-slate-600 group-hover:scale-110 transition-transform">
                <UploadIcon className={`w-8 h-8 transition-colors ${disabled ? 'text-slate-600' : 'text-slate-400 group-hover:text-cyan-400'}`} />
            </div>
            <p className="mb-2 text-lg text-slate-300">
                <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, or WEBP (MAX. 10MB)</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={disabled} />
        </label>
        <div className="lg:w-1/2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200">
                <LightbulbIcon className="w-6 h-6 text-yellow-400" />
                Tips for a Clear Analysis
            </h3>
            <ul className="mt-4 space-y-2 text-slate-400 text-sm list-disc list-inside">
                <li>Use a brightly lit room, but avoid direct flash on the eye.</li>
                <li>Keep the camera steady and ensure the eye is in sharp focus.</li>
                <li>Get as close as possible while keeping the image clear.</li>
                <li>Remove glasses and ensure eyes are wide open.</li>
                <li>Take the photo straight-on, not from an angle.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};