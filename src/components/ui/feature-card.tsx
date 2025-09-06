import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="group card-hover bg-gradient-card border-border/50 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
      <CardContent className="p-8 text-center relative z-10">
        <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-gradient-accent flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-soft">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};