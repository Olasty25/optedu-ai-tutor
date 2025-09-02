import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Preferences = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && interests) {
      localStorage.setItem("userAge", age);
      localStorage.setItem("userInterests", interests);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white">Optedu AI</span>
          </Link>
          <p className="text-white/80">Let's personalize your learning experience</p>
        </div>

        <Card className="shadow-glow border-white/10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-accent flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="age" className="text-base font-medium">How old are you?</Label>
                <Input
                  id="age"
                  placeholder="e.g. 19"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="interests" className="text-base font-medium">What are you good in?</Label>
                <Input
                  id="interests"
                  placeholder="e.g. Biology, Engineering"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white py-3"
              >
                Next
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;