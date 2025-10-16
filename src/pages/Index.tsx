import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Sparkles } from "lucide-react";

interface Question {
  question: string;
  image?: string;
  options: string[];
  correct: string;
  points: number;
}

interface Category {
  questions: Question[];
}

interface QuizData {
  categories: {
    [key: string]: Category;
  };
}

type GameScreen = "setup" | "category" | "quiz" | "results";

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>("setup");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch((err) => {
        console.error("Failed to load quiz data:", err);
        toast.error("Failed to load quiz questions");
      });
  }, []);

  const startGame = () => {
    if (team1Name.trim() && team2Name.trim()) {
      setScreen("category");
    } else {
      toast.error("Please enter names for both teams");
    }
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScreen("quiz");
  };

  const currentQuestion = quizData?.categories[selectedCategory]?.questions[currentQuestionIndex];

  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    setShowAnswer(true);
    const isCorrect = selectedAnswer === currentQuestion?.correct;

    if (isCorrect) {
      if (currentTeam === 1) {
        setTeam1Score((prev) => prev + (currentQuestion?.points || 0));
      } else {
        setTeam2Score((prev) => prev + (currentQuestion?.points || 0));
      }
      toast.success(`Correct! ${currentTeam === 1 ? team1Name : team2Name} earned ${currentQuestion?.points} points!`);
    } else {
      toast.error(`Incorrect! The correct answer was: ${currentQuestion?.correct}`);
    }
  };

  const nextQuestion = () => {
    const totalQuestions = quizData?.categories[selectedCategory]?.questions.length || 0;
    
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowAnswer(false);
      setCurrentTeam(currentTeam === 1 ? 2 : 1);
    } else {
      setScreen("results");
    }
  };

  const resetGame = () => {
    setScreen("setup");
    setTeam1Name("");
    setTeam2Name("");
    setTeam1Score(0);
    setTeam2Score(0);
    setCurrentTeam(1);
    setSelectedCategory("");
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowAnswer(false);
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-foreground text-2xl animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-4 md:p-8">
      {/* Score Display - Always Visible */}
      {screen !== "setup" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-card/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-card border border-border flex items-center gap-6">
            <div className={`flex items-center gap-2 ${currentTeam === 1 ? 'animate-glow-pulse' : ''}`}>
              <div className="w-3 h-3 rounded-full bg-quiz-team-one"></div>
              <span className="font-bold text-foreground">{team1Name}:</span>
              <span className="text-primary text-lg font-bold">{team1Score}</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className={`flex items-center gap-2 ${currentTeam === 2 ? 'animate-glow-pulse' : ''}`}>
              <div className="w-3 h-3 rounded-full bg-quiz-team-two"></div>
              <span className="font-bold text-foreground">{team2Name}:</span>
              <span className="text-primary text-lg font-bold">{team2Score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Setup Screen */}
      {screen === "setup" && (
        <div className="max-w-2xl mx-auto pt-20 animate-fade-in">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-gold mb-6 animate-scale-in">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Quiz Battle
            </h1>
            <p className="text-muted-foreground text-lg">Enter team names to begin the challenge</p>
          </div>

          <Card className="bg-gradient-card border-border p-8 shadow-card">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team 1 Name</label>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="Enter team 1 name"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team 2 Name</label>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="Enter team 2 name"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={startGame}
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 shadow-glow transition-all"
              >
                Start Game <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Category Selection */}
      {screen === "category" && (
        <div className="max-w-4xl mx-auto pt-32 animate-fade-in">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            <span className={currentTeam === 1 ? 'text-quiz-team-one' : 'text-quiz-team-two'}>
              {currentTeam === 1 ? team1Name : team2Name}
            </span>
            , Choose Your Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(quizData.categories).map((category, index) => (
              <Card
                key={category}
                onClick={() => selectCategory(category)}
                className="bg-gradient-card border-border p-8 cursor-pointer hover:scale-105 transition-all shadow-card hover:shadow-glow group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {category}
                </h3>
                <p className="text-muted-foreground mt-2">10 Questions • 10 points each</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Screen */}
      {screen === "quiz" && currentQuestion && (
        <div className="max-w-3xl mx-auto pt-32 animate-fade-in">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-primary font-bold text-lg">{selectedCategory}</span>
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizData.categories[selectedCategory].questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-gold transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quizData.categories[selectedCategory].questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <Card className="bg-gradient-card border-border p-8 shadow-card mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">{currentQuestion.question}</h3>

            {currentQuestion.image && (
              <div className="mb-6 rounded-lg overflow-hidden bg-secondary">
                <img
                  src={`/images/${currentQuestion.image}`}
                  alt="Question"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800";
                  }}
                />
              </div>
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showAnswer && setSelectedAnswer(option)}
                  disabled={showAnswer}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                    selectedAnswer === option
                      ? showAnswer
                        ? option === currentQuestion.correct
                          ? "border-quiz-correct bg-quiz-correct/20 text-quiz-correct"
                          : "border-quiz-incorrect bg-quiz-incorrect/20 text-quiz-incorrect"
                        : "border-primary bg-primary/20 text-primary"
                      : showAnswer && option === currentQuestion.correct
                      ? "border-quiz-correct bg-quiz-correct/20 text-quiz-correct"
                      : "border-border bg-secondary text-foreground hover:border-primary hover:bg-primary/10"
                  } ${showAnswer ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            {!showAnswer ? (
              <Button
                onClick={submitAnswer}
                className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 shadow-glow"
              >
                Submit Answer
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setScreen("category");
                    setSelectedAnswer("");
                    setShowAnswer(false);
                  }}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  Choose Another Category
                </Button>
                <Button
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 shadow-glow"
                >
                  {currentQuestionIndex + 1 < quizData.categories[selectedCategory].questions.length
                    ? "Next Question"
                    : "View Results"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Screen */}
      {screen === "results" && (
        <div className="max-w-2xl mx-auto pt-32 animate-fade-in text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-gold mb-6 animate-scale-in">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-5xl font-bold text-foreground mb-4">Game Over!</h2>
            <p className="text-muted-foreground text-xl">
              {team1Score > team2Score
                ? `${team1Name} Wins!`
                : team2Score > team1Score
                ? `${team2Name} Wins!`
                : "It's a Tie!"}
            </p>
          </div>

          <Card className="bg-gradient-card border-border p-8 shadow-card mb-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center p-6 bg-secondary rounded-lg">
                <span className="text-xl font-bold text-foreground">{team1Name}</span>
                <span className="text-3xl font-bold text-primary">{team1Score}</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-secondary rounded-lg">
                <span className="text-xl font-bold text-foreground">{team2Name}</span>
                <span className="text-3xl font-bold text-primary">{team2Score}</span>
              </div>
            </div>
          </Card>

          <Button
            onClick={resetGame}
            className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 px-12 shadow-glow"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
