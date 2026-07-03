'use client';

import { useCompletion } from 'ai/react';
import { useEffect, useState } from 'react';
import { secureRandom } from '@/lib/utils';

const FALLBACK_QUOTES = [
  { text: "A library is not a luxury but one of the necessities of life.", author: "Henry Ward Beecher" },
  { text: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.", author: "Haruki Murakami" },
  { text: "A book is like a garden carried in the pocket.", author: "Chinese Proverb" },
  { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
  { text: "To read a poem is to hear it with our eyes; to hear it is to see it with our ears.", author: "Octavio Paz" },
  { text: "A book is a version of the world. If you do not like it, ignore it; or offer your own version in return.", author: "Salman Rushdie" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
  { text: "There are worse crimes than burning books. One of them is not reading them.", author: "Joseph Brodsky" },
];

export function StreamingQuote() {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/quote',
  });

  const [fallbackQuote, setFallbackQuote] = useState(() => FALLBACK_QUOTES[0]);
  
  useEffect(() => {
    // Select a random fallback quote on mount to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFallbackQuote(FALLBACK_QUOTES[Math.floor(secureRandom() * FALLBACK_QUOTES.length)]);
    
    // Fire the streaming completion request immediately
    complete(''); 
  }, [complete]);

  // Parse the streamed text on the fly
  let text = completion;
  let author = '';
  
  if (completion.includes('" - ')) {
    const parts = completion.split('" - ');
    text = parts[0] + '"'; // restore the quote
    author = parts[1];
  } else if (completion.includes(' - ')) {
    const parts = completion.split(' - ');
    text = parts[0];
    author = parts[1];
  }

  // If there's an error or we finished but got nothing, use fallback
  const isFailed = error || (!isLoading && !completion);
  let displayQuote = '';
  if (isFailed) {
    displayQuote = fallbackQuote.text;
  } else if (completion) {
    displayQuote = text;
  }
  const displayAuthor = isFailed ? fallbackQuote.author : author;

  let formattedQuote = '';
  if (displayQuote) {
    if (displayQuote.startsWith('"')) {
      formattedQuote = displayQuote;
    } else {
      formattedQuote = `"${displayQuote}"`;
    }
  }

  return (
    <>
      <blockquote className="font-serif text-xl lg:text-2xl text-[#1A1A1A] leading-relaxed italic mb-6 min-h-[96px]">
        {formattedQuote}
        {isLoading && <span className="inline-block w-1.5 h-6 ml-1 align-middle bg-[#1A1A1A]/80 animate-pulse" />}
      </blockquote>
      <p className="font-sans text-xs tracking-[0.1em] text-[#747878] uppercase font-bold min-h-[16px]">
        {displayAuthor}
      </p>
    </>
  );
}
