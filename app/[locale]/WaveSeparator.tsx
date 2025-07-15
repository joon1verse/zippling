// app/[locale]/WaveSeparator.tsx

interface WaveSeparatorProps {
    className?: string;
  }
  
  export default function WaveSeparator({ className }: WaveSeparatorProps) {
    return (
      <div className="bg-white">
        <svg
          className={`w-full h-auto ${className}`}
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1440,50 C1200,150 900,0 720,50 C540,100 240,-50 0,50 L0,100 L1440,100 Z"
          />
        </svg>
      </div>
    );
  }