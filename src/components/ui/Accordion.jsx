// src/components/ui/Accordion.jsx
// Reusable accordion components
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const Accordion = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const AccordionItem = ({ children, value, className = '' }) => (
  <div className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${className}`} data-value={value}>
    {children}
  </div>
);

export const AccordionTrigger = ({ children, onClick, isOpen, className = '' }) => (
  <button
    onClick={onClick}
    aria-expanded={isOpen}
    className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left ${className}`}
  >
    {children}
    {isOpen ?
      <ChevronUp className="h-4 w-4 transition-transform duration-200 text-gray-500 dark:text-gray-400" /> :
      <ChevronDown className="h-4 w-4 transition-transform duration-200 text-gray-500 dark:text-gray-400" />
    }
  </button>
);

export const AccordionContent = ({ children, isOpen, className = '' }) => (
  <div
    className={`overflow-hidden text-sm transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 pb-4' : 'max-h-0 opacity-0'
      } ${className}`}
  >
    <div className="pt-0">{children}</div>
  </div>
);
