import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AgePickerProps {
  value: number;
  onChange: (age: number) => void;
  className?: string;
}

export function AgePicker({ value, onChange, className }: AgePickerProps) {
  const [selectedDecade, setSelectedDecade] = useState(Math.floor(value / 10) * 10);
  
  const decades = [
    { start: 18, end: 29, label: "18-29" },
    { start: 30, end: 39, label: "30-39" },
    { start: 40, end: 49, label: "40-49" },
    { start: 50, end: 59, label: "50-59" },
    { start: 60, end: 69, label: "60-69" },
    { start: 70, end: 79, label: "70-79" }
  ];
  
  const currentDecade = decades.find(d => value >= d.start && value <= d.end) || decades[0];
  const ageRange = Array.from({ length: 12 }, (_, i) => selectedDecade + i).filter(age => age >= 18 && age <= 79);
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Decade Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {decades.map((decade) => (
          <button
            key={decade.start}
            onClick={() => setSelectedDecade(decade.start)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedDecade === decade.start
                ? "bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] text-white scale-105 shadow-lg"
                : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/20"
            )}
          >
            {decade.label}
          </button>
        ))}
      </div>
      
      {/* Age Wheel */}
      <div className="relative">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
          <div className="relative h-64 overflow-hidden">
            {/* Center highlight */}
            <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 bg-gradient-to-r from-[#FF8C00]/20 to-[#FF6B6B]/20 rounded-xl border-2 border-[#FF8C00]/50" />
            
            {/* Age numbers */}
            <div className="relative h-full flex flex-col justify-center items-center space-y-2 py-8">
              {ageRange.map((age, index) => {
                const distance = Math.abs(age - value);
                const isSelected = age === value;
                
                return (
                  <button
                    key={age}
                    onClick={() => onChange(age)}
                    className={cn(
                      "w-16 h-16 rounded-full font-bold text-lg transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] text-white scale-125 shadow-xl border-4 border-white/50"
                        : distance === 1
                        ? "bg-white/20 text-white/80 scale-110"
                        : distance === 2
                        ? "bg-white/10 text-white/60 scale-100"
                        : "bg-white/5 text-white/40 scale-90 opacity-50"
                    )}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Age Buttons */}
      <div className="flex justify-center space-x-4">
        {[20, 25, 30, 35, 40, 45, 50].map((age) => (
          <button
            key={age}
            onClick={() => {
              onChange(age);
              setSelectedDecade(Math.floor(age / 10) * 10);
            }}
            className={cn(
              "w-12 h-12 rounded-full text-sm font-medium transition-all",
              value === age
                ? "bg-[#FF8C00] text-white scale-110"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            )}
          >
            {age}
          </button>
        ))}
      </div>
      
      {/* Age Display */}
      <div className="text-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] bg-clip-text text-transparent">
          {value}
        </div>
        <div className="text-white/60 text-sm mt-1">years old</div>
      </div>
    </div>
  );
}
