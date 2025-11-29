import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, FileText, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "퀴즈",
      icon: GraduationCap,
      description: "선생님과 함께하는 즐거운 퀴즈 시간",
      path: "/teacher/quiz",
    },
    {
      title: "토론",
      icon: Users,
      description: "친구들과 함께 이야기해요",
      path: "/teacher/discussion",
    },
    {
      title: "접근성 가이드 작성",
      icon: FileText,
      description: "우리 학교 접근성 지도 만들기",
      path: "/accessibility-guide",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-blue-900 tracking-tight">
            모모탐사대
          </h1>
          <p className="text-xl text-blue-600 font-medium">
            함께 배우고 성장하는 우리 반
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={item.title}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-100 overflow-hidden"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
