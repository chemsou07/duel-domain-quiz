import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Sparkles, Plus, Minus } from "lucide-react";

interface Question {
  question: string;
  image?: string;
  answer: string;
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch((err) => {
        console.error("Failed to load quiz data:", err);
        toast.error("فشل في تحميل أسئلة المسابقة");
      });
  }, []);

  const startGame = () => {
    if (team1Name.trim() && team2Name.trim()) {
      setScreen("category");
    } else {
      toast.error("الرجاء إدخال أسماء الفريقين");
    }
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setScreen("quiz");
  };

  const currentQuestion = quizData?.categories[selectedCategory]?.questions[currentQuestionIndex];

  const awardPoints = (team: 1 | 2, points: number) => {
    if (team === 1) {
      setTeam1Score((prev) => prev + points);
      toast.success(`${team1Name} حصل على ${points} نقطة!`);
    } else {
      setTeam2Score((prev) => prev + points);
      toast.success(`${team2Name} حصل على ${points} نقطة!`);
    }
  };

  const adjustScore = (team: 1 | 2, amount: number) => {
    if (team === 1) {
      setTeam1Score((prev) => Math.max(0, prev + amount));
    } else {
      setTeam2Score((prev) => Math.max(0, prev + amount));
    }
  };

  const nextQuestion = () => {
    const totalQuestions = quizData?.categories[selectedCategory]?.questions.length || 0;
    
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
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
    setShowAnswer(false);
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-foreground text-2xl animate-pulse">جاري تحميل المسابقة...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-4 md:p-8">
      {/* Score Display - Always Visible */}
      {screen !== "setup" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-card/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-card border border-border flex items-center gap-6">
            <div className={`flex items-center gap-2 ${currentTeam === 1 ? "animate-glow-pulse" : ""}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(1, 1)}
                  className="w-6 h-6 rounded-full bg-quiz-team-one/20 hover:bg-quiz-team-one/40 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 text-quiz-team-one" />
                </button>
                <button
                  onClick={() => adjustScore(1, -1)}
                  className="w-6 h-6 rounded-full bg-quiz-team-one/20 hover:bg-quiz-team-one/40 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 text-quiz-team-one" />
                </button>
              </div>
              <div className="w-3 h-3 rounded-full bg-quiz-team-one"></div>
              <span className="font-bold text-foreground">{team1Name}:</span>
              <span className="text-primary text-lg font-bold">{team1Score}</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className={`flex items-center gap-2 ${currentTeam === 2 ? "animate-glow-pulse" : ""}`}>
              <div className="w-3 h-3 rounded-full bg-quiz-team-two"></div>
              <span className="font-bold text-foreground">{team2Name}:</span>
              <span className="text-primary text-lg font-bold">{team2Score}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(2, 1)}
                  className="w-6 h-6 rounded-full bg-quiz-team-two/20 hover:bg-quiz-team-two/40 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 text-quiz-team-two" />
                </button>
                <button
                  onClick={() => adjustScore(2, -1)}
                  className="w-6 h-6 rounded-full bg-quiz-team-two/20 hover:bg-quiz-team-two/40 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 text-quiz-team-two" />
                </button>
              </div>
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
              مسابقة الفرق
            </h1>
            <p className="text-muted-foreground text-lg">أدخل أسماء الفرق لبدء التحدي</p>
          </div>

          <Card className="bg-gradient-card border-border p-8 shadow-card">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">اسم الفريق الأول</label>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="أدخل اسم الفريق الأول"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">اسم الفريق الثاني</label>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="أدخل اسم الفريق الثاني"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={startGame}
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 shadow-glow transition-all"
              >
                ابدأ المسابقة <Sparkles className="mr-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Category Selection */}
      {screen === "category" && (
        <div className="max-w-4xl mx-auto pt-32 animate-fade-in">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            <span className={currentTeam === 1 ? "text-quiz-team-one" : "text-quiz-team-two"}>
              {currentTeam === 1 ? team1Name : team2Name}
            </span>
            ، اختر الفئة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(quizData.categories).map((category, index) => (
              <Card
                key={category}
                onClick={() => selectCategory(category)}
                className="bg-gradient-card border-border p-8 cursor-pointer hover:scale-105 transition-all shadow-card hover:shadow-glow group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {category}
                </h3>
                <p className="text-muted-foreground mt-2">10 أسئلة • 10 نقاط لكل سؤال</p>
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
                السؤال {currentQuestionIndex + 1} من {quizData.categories[selectedCategory].questions.length}
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
                  alt="السؤال"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800";
                  }}
                />
              </div>
            )}

            {showAnswer && (
              <div className="p-6 rounded-lg bg-quiz-correct/20 border-2 border-quiz-correct mb-6 animate-fade-in">
                <p className="text-quiz-correct font-bold text-lg mb-2">الإجابة الصحيحة:</p>
                <p className="text-foreground text-xl">{currentQuestion.answer}</p>
              </div>
            )}

            {!showAnswer && (
              <Button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border font-medium text-lg py-4"
              >
                إظهار الإجابة
              </Button>
            )}
          </Card>

          {showAnswer && (
            <div className="space-y-4">
              <div className="text-center text-foreground font-medium mb-4">
                من أجاب بشكل صحيح؟
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button
                  onClick={() => awardPoints(1, currentQuestion.points)}
                  className="bg-quiz-team-one hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow"
                >
                  {team1Name}
                  <br />
                  <span className="text-sm">+{currentQuestion.points} نقطة</span>
                </Button>
                <Button
                  onClick={() => awardPoints(2, currentQuestion.points)}
                  className="bg-quiz-team-two hover:opacity-90 text-white font-bold text-lg py-6 shadow-glow"
                >
                  {team2Name}
                  <br />
                  <span className="text-sm">+{currentQuestion.points} نقطة</span>
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setScreen("category");
                    setShowAnswer(false);
                  }}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  اختر فئة أخرى
                </Button>
                <Button
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg py-6 shadow-glow"
                >
                  {currentQuestionIndex + 1 < quizData.categories[selectedCategory].questions.length
                    ? "السؤال التالي"
                    : "عرض النتائج"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Screen */}
      {screen === "results" && (
        <div className="max-w-2xl mx-auto pt-32 animate-fade-in text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-gold mb-6 animate-scale-in">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-5xl font-bold text-foreground mb-4">انتهت المسابقة!</h2>
            <p className="text-muted-foreground text-xl">
              {team1Score > team2Score
                ? `${team1Name} هو الفائز! 🎉`
                : team2Score > team1Score
                ? `${team2Name} هو الفائز! 🎉`
                : "التعادل! 🤝"}
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
            العب مرة أخرى
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
