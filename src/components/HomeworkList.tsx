import { Clock, CheckCircle2, Circle, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Homework } from "@/pages/Index";

interface HomeworkListProps {
  homework: Homework[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const subjectColors = {
  Math: "subjects-math",
  Science: "subjects-science", 
  English: "subjects-english",
  History: "subjects-history",
  Other: "subjects-other",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

export function HomeworkList({ homework, onToggle, onDelete }: HomeworkListProps) {
  if (homework.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
        <p className="text-muted-foreground">Add some homework to get started with your study plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {homework.map((item) => (
        <Card key={item.id} className={`transition-all hover:shadow-medium ${item.completed ? "opacity-60" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Completion Toggle */}
              <button
                onClick={() => onToggle(item.id)}
                className="mt-1 transition-colors"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="secondary"
                        className={`${subjectColors[item.subject as keyof typeof subjectColors] || subjectColors.Other}`}
                      >
                        {item.subject}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={priorityColors[item.priority]}
                      >
                        {item.priority === "high" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <h3 className={`font-medium mb-1 ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.estimatedTime} min</span>
                      </div>
                      <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}