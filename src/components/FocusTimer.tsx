import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Shield, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { Homework } from "@/pages/Index";

interface FocusTimerProps {
  homework: Homework[];
}

export function FocusTimer({ homework }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState<Homework | null>(null);
  const [appsBlocked, setAppsBlocked] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (homework_item?: Homework) => {
    if (homework_item) {
      setCurrentSession(homework_item);
      setTimeLeft(Math.min(homework_item.estimatedTime * 60, 25 * 60)); // Max 25 minutes
    }
    setIsRunning(true);
    setAppsBlocked(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setAppsBlocked(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
    setCurrentSession(null);
    setAppsBlocked(false);
  };

  const startBreak = () => {
    setIsBreak(true);
    setTimeLeft(5 * 60); // 5 minute break
    setCurrentSession(null);
    setAppsBlocked(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false);
      setAppsBlocked(false);
      
      if (isBreak) {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      } else {
        setCompletedSessions(prev => prev + 1);
        // Auto-start break after study session
        startBreak();
      }
    }
  }, [timeLeft, isBreak]);

  const getProgress = () => {
    const totalTime = isBreak ? 5 * 60 : (currentSession ? Math.min(currentSession.estimatedTime * 60, 25 * 60) : 25 * 60);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  if (homework.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No homework to focus on</h3>
        <p className="text-muted-foreground">Add some homework first to start focus sessions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Lock In</h2>
        <p className="text-sm text-muted-foreground">
          Stay focused with timed study sessions and app blocking
        </p>
      </div>

      {/* Timer Display */}
      <Card className="bg-gradient-focus border-0 text-white">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            {currentSession ? (
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                  {currentSession.subject}
                </Badge>
                <h3 className="text-lg font-medium">{currentSession.title}</h3>
              </div>
            ) : isBreak ? (
              <h3 className="text-lg font-medium mb-2">Break Time</h3>
            ) : (
              <h3 className="text-lg font-medium mb-2">Focus Session</h3>
            )}
          </div>
          
          <div className="text-6xl font-bold mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          
          <Progress value={getProgress()} className="mb-6 h-2 bg-white/20" />
          
          <div className="flex items-center justify-center space-x-3">
            {!isRunning ? (
              <Button 
                onClick={() => startTimer(currentSession || undefined)}
                size="lg"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Play className="w-5 h-5 mr-2" />
                {currentSession || isBreak ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer}
                size="lg"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={resetTimer}
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Blocking Status */}
      {appsBlocked && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <Lock className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Apps Blocked:</strong> Social media and entertainment apps are now blocked. Stay focused on your studies!
          </AlertDescription>
        </Alert>
      )}

      {!appsBlocked && completedSessions > 0 && (
        <Alert className="border-success/20 bg-success/10">
          <Unlock className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Apps are unlocked during break time. Great work on completing {completedSessions} session{completedSessions > 1 ? 's' : ''}!
          </AlertDescription>
        </Alert>
      )}

      {/* Homework Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Homework to Focus On</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {homework.slice(0, 5).map((item) => (
              <div 
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-soft ${
                  currentSession?.id === item.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setCurrentSession(item)}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.subject}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.priority === "high" ? "border-destructive/20 text-destructive" : 
                        item.priority === "medium" ? "border-warning/20 text-warning" :
                        "border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{item.title}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.estimatedTime} min
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}