import { useState } from "react";
import { Clock, Coffee, BookOpen, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Homework } from "@/pages/Index";

interface StudyPlanProps {
  homework: Homework[];
}

interface StudySession {
  id: string;
  type: "study" | "break";
  homework?: Homework;
  duration: number;
  startTime: string;
  endTime: string;
}

export function StudyPlan({ homework }: StudyPlanProps) {
  const [studyPlan, setStudyPlan] = useState<StudySession[]>([]);

  const generateStudyPlan = () => {
    if (homework.length === 0) return;

    const sessions: StudySession[] = [];
    let currentTime = new Date();
    // Round to next 30-minute interval
    currentTime.setMinutes(Math.ceil(currentTime.getMinutes() / 30) * 30);
    currentTime.setSeconds(0);

    // Sort homework by priority and due date
    const sortedHomework = [...homework].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    sortedHomework.forEach((hw, index) => {
      // Add study session
      const sessionStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + hw.estimatedTime);
      const sessionEnd = new Date(currentTime);

      sessions.push({
        id: `study-${hw.id}`,
        type: "study",
        homework: hw,
        duration: hw.estimatedTime,
        startTime: sessionStart.toISOString(),
        endTime: sessionEnd.toISOString(),
      });

      // Add break after study session (except for the last one)
      if (index < sortedHomework.length - 1) {
        const breakStart = new Date(currentTime);
        const breakDuration = hw.estimatedTime >= 60 ? 15 : 10; // Longer breaks for longer sessions
        currentTime.setMinutes(currentTime.getMinutes() + breakDuration);
        const breakEnd = new Date(currentTime);

        sessions.push({
          id: `break-${index}`,
          type: "break",
          duration: breakDuration,
          startTime: breakStart.toISOString(),
          endTime: breakEnd.toISOString(),
        });
      }
    });

    setStudyPlan(sessions);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalStudyTime = () => {
    return studyPlan
      .filter(session => session.type === "study")
      .reduce((total, session) => total + session.duration, 0);
  };

  const getEstimatedEndTime = () => {
    if (studyPlan.length === 0) return null;
    return formatTime(studyPlan[studyPlan.length - 1].endTime);
  };

  if (homework.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No homework to plan</h3>
        <p className="text-muted-foreground">Add some homework first to generate your study plan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Smart Study Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Optimized based on priority and due dates
          </p>
        </div>
        <Button 
          onClick={generateStudyPlan}
          className="bg-gradient-primary hover:opacity-90 text-white shadow-medium"
        >
          <Target className="w-4 h-4 mr-2" />
          Generate Plan
        </Button>
      </div>

      {studyPlan.length > 0 && (
        <>
          {/* Study Plan Summary */}
          <Card className="mb-6 bg-gradient-focus border-0 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{homework.length}</div>
                  <div className="text-sm opacity-90">Assignments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(getTotalStudyTime() / 60)}h {getTotalStudyTime() % 60}m</div>
                  <div className="text-sm opacity-90">Study Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{getEstimatedEndTime()}</div>
                  <div className="text-sm opacity-90">Estimated End</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Sessions */}
          <div className="space-y-3">
            {studyPlan.map((session, index) => (
              <Card key={session.id} className={`${
                session.type === "study" 
                  ? "border-l-4 border-l-primary bg-card" 
                  : "border-l-4 border-l-success bg-success/5"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {session.type === "study" ? (
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                          <Coffee className="w-5 h-5 text-success" />
                        </div>
                      )}
                      
                      <div>
                        {session.type === "study" && session.homework ? (
                          <>
                            <h3 className="font-medium text-foreground">{session.homework.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {session.homework.subject}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  session.homework.priority === "high" 
                                    ? "border-destructive/20 text-destructive" 
                                    : session.homework.priority === "medium"
                                    ? "border-warning/20 text-warning"
                                    : "border-muted-foreground/20 text-muted-foreground"
                                }`}
                              >
                                {session.homework.priority}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <h3 className="font-medium text-success">Take a Break</h3>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.duration} min</span>
                          </div>
                          <div>
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-muted-foreground">
                        Session {index + 1}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}