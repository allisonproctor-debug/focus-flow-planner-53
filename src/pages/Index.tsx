import { useState } from "react";
import { Calendar, Clock, Target, BookOpen, Play, Pause, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeworkList } from "@/components/HomeworkList";
import { StudyPlan } from "@/components/StudyPlan";
import { FocusTimer } from "@/components/FocusTimer";
import { AddHomeworkDialog } from "@/components/AddHomeworkDialog";

export interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

const Index = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"homework" | "plan" | "focus">("homework");

  const addHomework = (newHomework: Omit<Homework, "id">) => {
    const homework_item: Homework = {
      ...newHomework,
      id: Date.now().toString(),
    };
    setHomework(prev => [...prev, homework_item]);
  };

  const toggleHomework = (id: string) => {
    setHomework(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteHomework = (id: string) => {
    setHomework(prev => prev.filter(item => item.id !== id));
  };

  const totalEstimatedTime = homework
    .filter(item => !item.completed)
    .reduce((total, item) => total + item.estimatedTime, 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Vision</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{Math.round(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m remaining</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          {[
            { id: "homework", label: "Homework", icon: BookOpen },
            { id: "plan", label: "Study Plan", icon: Calendar },
            { id: "focus", label: "Focus Mode", icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === "homework" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Your Homework</h2>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Homework
                </Button>
              </div>
              <HomeworkList 
                homework={homework} 
                onToggle={toggleHomework}
                onDelete={deleteHomework}
              />
            </div>
          )}

          {activeTab === "plan" && (
            <StudyPlan homework={homework.filter(item => !item.completed)} />
          )}

          {activeTab === "focus" && (
            <FocusTimer homework={homework.filter(item => !item.completed)} />
          )}
        </div>
      </main>

      <AddHomeworkDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addHomework}
      />
    </div>
  );
};

export default Index;