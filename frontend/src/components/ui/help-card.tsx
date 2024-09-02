import React, { useState, useRef, useEffect } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Button } from "./button"; // Assuming Button is in the same directory

interface HelpCardProps {
  content: React.ReactNode;
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string; // For additional custom styling
}

export const HelpCard: React.FC<HelpCardProps> = ({
  content,
  buttonText = "?",
  buttonSize = "icon",
  buttonVariant = "link",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const openTimeoutRef = useRef<number | null>(null);  // Using number type for setTimeout
  const closeTimeoutRef = useRef<number | null>(null); // Using number type for setTimeout
  const containerRef = useRef<HTMLDivElement>(null);   // Reference to container div

  const openCard = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    openTimeoutRef.current = window.setTimeout(() => setOpen(true), 500);
  };

  const closeCard = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => setOpen(false), 500);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <HoverCard open={open}>
        <HoverCardTrigger asChild>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={`text-base ${className}`}
            onMouseEnter={openCard}
            onMouseLeave={closeCard}
            onClick={() => {
              if (openTimeoutRef.current) {
                clearTimeout(openTimeoutRef.current);
              }
              setOpen(true);
            }}
          >
            {buttonText}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
            }
          }}
          onMouseLeave={closeCard}
          className="text-sm"
        >
          {content}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
