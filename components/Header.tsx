import React from 'react';

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <EyeIcon className="w-12 h-12 text-cyan-400" />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 text-transparent bg-clip-text">
          AI Eye Disease Detection
        </h1>
      </div>
      <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
        Upload a clear, well-lit photo of an eye to get an AI-powered analysis of potential health concerns.
      </p>
      <hr className="w-1/3 mx-auto mt-6 border-slate-700/60" />
    </header>
  );
};