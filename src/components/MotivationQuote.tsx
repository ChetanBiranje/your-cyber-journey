import { Card3D } from "./Card3D";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The future belongs to those who learn more skills and combine them in creative ways.", author: "Robert Greene" },
  { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
  { text: "The more you sweat in training, the less you bleed in combat.", author: "Richard Marcinko" },
  { text: "Hackers are breaking the systems for profit. Before, it was about intellectual curiosity and pursuit of knowledge.", author: "Kevin Mitnick" },
  { text: "The best defense is a good offense.", author: "Jack Dempsey" },
  { text: "Every master was once a disaster.", author: "T. Harv Eker" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
];

export function MotivationQuote() {
  const [currentQuote, setCurrentQuote] = useState(() => 
    quotes[Math.floor(Math.random() * quotes.length)]
  );

  const refreshQuote = () => {
    let newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    while (newQuote.text === currentQuote.text) {
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    setCurrentQuote(newQuote);
  };

  return (
    <Card3D variant="glass" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Daily Motivation</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshQuote}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <blockquote className="text-lg font-medium leading-relaxed mb-3">
          "{currentQuote.text}"
        </blockquote>
        <cite className="text-sm text-muted-foreground">— {currentQuote.author}</cite>
      </div>
    </Card3D>
  );
}
