import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import type { Language } from "@shared/schema";

interface LanguageCardProps {
  language: Language;
  exerciseCount?: number;
  image?: string;
}

export default function LanguageCard({ language, exerciseCount, image }: LanguageCardProps) {
  const displayCount = exerciseCount !== undefined ? exerciseCount : language.exerciseCount;
  
  return (
    <Card className="group transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="p-8">
        {/* Language Logo */}
        <div className="flex items-center justify-center w-20 h-20 rounded-xl mb-6 bg-muted/50 group-hover:scale-110 transition-transform">
          {image ? (
            <img 
              src={image} 
              alt={`${language.name} logo`}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div 
              className="flex items-center justify-center w-16 h-16 rounded-lg"
              style={{ background: language.color }}
            >
              <i className={`${language.icon} text-2xl text-white`}></i>
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
          {language.name}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed mb-6">
          {language.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-primary">
            {displayCount} ejercicios
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/language/${language.slug}`} className="flex-1">
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Play className="h-4 w-4 mr-2" />
              Comenzar
            </Button>
          </Link>
          <Link href={`/language/${language.slug}?tab=advanced`}>
            <Button variant="outline" size="icon" className="group-hover:border-primary transition-colors">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
