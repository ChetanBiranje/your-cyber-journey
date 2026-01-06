import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Target, Save, Shield, GraduationCap, Briefcase, AlertTriangle, Sparkles } from "lucide-react";

interface Profile {
  full_name: string | null;
  current_weight: number;
  target_weight: number;
  current_phase: string;
  current_education: string | null;
  education_field: string | null;
  goal: string | null;
  challenges: string | null;
}

const educationOptions = [
  "10th Pass",
  "12th Pass", 
  "Diploma",
  "Bachelor's (1st Year)",
  "Bachelor's (2nd Year)",
  "Bachelor's (3rd Year)",
  "Bachelor's Completed",
  "Master's (1st Year)",
  "Master's (2nd Year)",
  "Master's Completed",
  "PhD Candidate",
];

const goalOptions = [
  "PhD in Cyber Security",
  "PhD in Computer Science",
  "PhD in Data Science",
  "Master's in Cyber Security",
  "Master's in Computer Science",
  "Master's in Data Science",
  "CEH Certification",
  "OSCP Certification",
  "AWS Solutions Architect",
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Security Researcher",
  "Penetration Tester",
  "Mobile App Developer",
  "Game Developer",
  "Blockchain Developer",
  "Other",
];

const roadmapTemplates: Record<string, { phase: string; title: string; description: string; monthsFromNow: number }[]> = {
  "PhD in Cyber Security": [
    { phase: "Foundation", title: "Complete Current Degree", description: "Finish your current education with good grades", monthsFromNow: 12 },
    { phase: "Foundation", title: "Learn Programming Basics", description: "Python, C, JavaScript fundamentals", monthsFromNow: 6 },
    { phase: "Foundation", title: "Networking Fundamentals", description: "TCP/IP, OSI Model, Network protocols", monthsFromNow: 8 },
    { phase: "Skills Building", title: "Linux Mastery", description: "Master Linux commands and system administration", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Web Security Basics", description: "OWASP Top 10, SQL Injection, XSS attacks", monthsFromNow: 14 },
    { phase: "Skills Building", title: "Practice on CTF Platforms", description: "TryHackMe, HackTheBox, PicoCTF", monthsFromNow: 16 },
    { phase: "Certifications", title: "CEH Certification", description: "Certified Ethical Hacker certification", monthsFromNow: 24 },
    { phase: "Certifications", title: "OSCP Certification", description: "Offensive Security Certified Professional", monthsFromNow: 30 },
    { phase: "Masters Prep", title: "GATE/GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 36 },
    { phase: "Masters", title: "M.Tech/MS in Cyber Security", description: "Complete Master's degree with research focus", monthsFromNow: 60 },
    { phase: "PhD Prep", title: "Research Paper Publication", description: "Publish papers in security conferences", monthsFromNow: 66 },
    { phase: "PhD Prep", title: "PhD Entrance & Admission", description: "Apply and get admitted to PhD program", monthsFromNow: 72 },
    { phase: "PhD", title: "PhD Coursework", description: "Complete PhD coursework requirements", monthsFromNow: 84 },
    { phase: "PhD", title: "Thesis Research", description: "Complete doctoral thesis research", monthsFromNow: 108 },
    { phase: "PhD", title: "PhD Defense & Completion", description: "Defend thesis and earn PhD degree", monthsFromNow: 120 },
  ],
  "PhD in Computer Science": [
    { phase: "Foundation", title: "Complete Current Degree", description: "Finish your current education with good grades", monthsFromNow: 12 },
    { phase: "Foundation", title: "Data Structures & Algorithms", description: "Master DSA concepts thoroughly", monthsFromNow: 8 },
    { phase: "Foundation", title: "Mathematics for CS", description: "Discrete math, linear algebra, probability", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Advanced Programming", description: "System programming, compiler design basics", monthsFromNow: 14 },
    { phase: "Skills Building", title: "Research Fundamentals", description: "Learn to read and analyze research papers", monthsFromNow: 18 },
    { phase: "Masters Prep", title: "GATE/GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 30 },
    { phase: "Masters", title: "M.Tech/MS in Computer Science", description: "Complete Master's degree", monthsFromNow: 54 },
    { phase: "PhD", title: "PhD Program", description: "Complete doctoral research and thesis", monthsFromNow: 96 },
  ],
  "PhD in Data Science": [
    { phase: "Foundation", title: "Statistics & Probability", description: "Strong foundation in statistics", monthsFromNow: 6 },
    { phase: "Foundation", title: "Python & R Programming", description: "Master data science languages", monthsFromNow: 8 },
    { phase: "Foundation", title: "Mathematics", description: "Linear algebra, calculus, optimization", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Machine Learning", description: "ML algorithms and implementations", monthsFromNow: 14 },
    { phase: "Skills Building", title: "Deep Learning", description: "Neural networks, TensorFlow, PyTorch", monthsFromNow: 18 },
    { phase: "Masters Prep", title: "GRE/GATE Preparation", description: "Prepare for entrance exams", monthsFromNow: 30 },
    { phase: "Masters", title: "MS in Data Science", description: "Complete Master's degree", monthsFromNow: 54 },
    { phase: "PhD", title: "PhD Research", description: "Original research contribution", monthsFromNow: 96 },
  ],
  "Master's in Cyber Security": [
    { phase: "Foundation", title: "Complete Current Degree", description: "Finish your current education with good grades", monthsFromNow: 12 },
    { phase: "Foundation", title: "Learn Programming Basics", description: "Python, C, JavaScript fundamentals", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Networking & Linux", description: "Master networking and Linux administration", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Web Security Basics", description: "OWASP Top 10, common vulnerabilities", monthsFromNow: 14 },
    { phase: "Certifications", title: "CompTIA Security+", description: "Entry-level security certification", monthsFromNow: 18 },
    { phase: "Entrance Prep", title: "GATE/GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 24 },
    { phase: "Masters", title: "M.Tech/MS in Cyber Security", description: "Complete Master's degree", monthsFromNow: 48 },
  ],
  "Master's in Data Science": [
    { phase: "Foundation", title: "Python Programming", description: "Master Python for data science", monthsFromNow: 4 },
    { phase: "Foundation", title: "Statistics & Mathematics", description: "Statistical foundations", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Machine Learning Basics", description: "Supervised and unsupervised learning", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Data Visualization", description: "Tableau, Power BI, matplotlib", monthsFromNow: 12 },
    { phase: "Entrance Prep", title: "GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 18 },
    { phase: "Masters", title: "MS in Data Science", description: "Complete Master's degree", monthsFromNow: 42 },
  ],
  "CEH Certification": [
    { phase: "Foundation", title: "Networking Basics", description: "TCP/IP, protocols, network architecture", monthsFromNow: 2 },
    { phase: "Foundation", title: "Linux Fundamentals", description: "Linux commands and administration", monthsFromNow: 3 },
    { phase: "Preparation", title: "CEH Study Material", description: "EC-Council official courseware", monthsFromNow: 4 },
    { phase: "Preparation", title: "Practice Labs", description: "Hands-on practice with hacking techniques", monthsFromNow: 5 },
    { phase: "Certification", title: "CEH Exam", description: "Pass the CEH certification exam", monthsFromNow: 6 },
  ],
  "OSCP Certification": [
    { phase: "Foundation", title: "Linux Mastery", description: "Advanced Linux skills required", monthsFromNow: 2 },
    { phase: "Foundation", title: "Programming Skills", description: "Python and Bash scripting", monthsFromNow: 3 },
    { phase: "Preparation", title: "PWK Course", description: "Penetration Testing with Kali Linux", monthsFromNow: 6 },
    { phase: "Preparation", title: "Lab Practice", description: "Complete all PWK lab machines", monthsFromNow: 9 },
    { phase: "Certification", title: "OSCP Exam", description: "24-hour practical exam", monthsFromNow: 12 },
  ],
  "AWS Solutions Architect": [
    { phase: "Foundation", title: "Cloud Computing Basics", description: "Understand cloud concepts", monthsFromNow: 1 },
    { phase: "Foundation", title: "AWS Free Tier Practice", description: "Hands-on with AWS services", monthsFromNow: 2 },
    { phase: "Learning", title: "AWS Core Services", description: "EC2, S3, VPC, IAM, RDS", monthsFromNow: 3 },
    { phase: "Learning", title: "AWS Advanced Services", description: "Lambda, API Gateway, CloudFormation", monthsFromNow: 4 },
    { phase: "Preparation", title: "Practice Exams", description: "Take multiple practice tests", monthsFromNow: 5 },
    { phase: "Certification", title: "SAA-C03 Exam", description: "Pass the Solutions Architect Associate exam", monthsFromNow: 6 },
  ],
  "Software Engineer": [
    { phase: "Foundation", title: "Programming Fundamentals", description: "Master one language (Python/Java/JavaScript)", monthsFromNow: 3 },
    { phase: "Foundation", title: "Data Structures & Algorithms", description: "Arrays, trees, graphs, sorting, searching", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Version Control (Git)", description: "Git, GitHub, collaboration workflows", monthsFromNow: 2 },
    { phase: "Skills Building", title: "Database Fundamentals", description: "SQL, NoSQL, database design", monthsFromNow: 8 },
    { phase: "Skills Building", title: "System Design Basics", description: "Scalability, load balancing, caching", monthsFromNow: 10 },
    { phase: "Projects", title: "Build Portfolio Projects", description: "3-5 significant projects on GitHub", monthsFromNow: 12 },
    { phase: "Interview Prep", title: "LeetCode Practice", description: "Solve 200+ problems", monthsFromNow: 14 },
    { phase: "Career", title: "Land Software Engineer Role", description: "Apply and interview at companies", monthsFromNow: 18 },
  ],
  "Full Stack Developer": [
    { phase: "Frontend", title: "HTML, CSS, JavaScript", description: "Core web technologies", monthsFromNow: 2 },
    { phase: "Frontend", title: "React/Vue/Angular", description: "Master a frontend framework", monthsFromNow: 4 },
    { phase: "Frontend", title: "Responsive Design", description: "Tailwind CSS, Bootstrap, mobile-first", monthsFromNow: 5 },
    { phase: "Backend", title: "Node.js/Python Backend", description: "Server-side programming", monthsFromNow: 7 },
    { phase: "Backend", title: "REST APIs & GraphQL", description: "API design and development", monthsFromNow: 8 },
    { phase: "Database", title: "SQL & NoSQL Databases", description: "PostgreSQL, MongoDB, Redis", monthsFromNow: 9 },
    { phase: "DevOps", title: "Deployment & CI/CD", description: "Docker, Vercel, GitHub Actions", monthsFromNow: 10 },
    { phase: "Projects", title: "Full Stack Projects", description: "Build complete applications", monthsFromNow: 12 },
    { phase: "Career", title: "Land Full Stack Role", description: "Job applications and interviews", monthsFromNow: 14 },
  ],
  "Frontend Developer": [
    { phase: "Foundation", title: "HTML & CSS Mastery", description: "Semantic HTML, CSS Grid, Flexbox", monthsFromNow: 2 },
    { phase: "Foundation", title: "JavaScript Deep Dive", description: "ES6+, async/await, DOM manipulation", monthsFromNow: 4 },
    { phase: "Framework", title: "React.js", description: "Components, hooks, state management", monthsFromNow: 6 },
    { phase: "Styling", title: "CSS Frameworks", description: "Tailwind CSS, styled-components", monthsFromNow: 7 },
    { phase: "Advanced", title: "TypeScript", description: "Type-safe JavaScript development", monthsFromNow: 8 },
    { phase: "Advanced", title: "Testing", description: "Jest, React Testing Library, Cypress", monthsFromNow: 9 },
    { phase: "Projects", title: "Portfolio Website", description: "Showcase your best work", monthsFromNow: 10 },
    { phase: "Career", title: "Land Frontend Role", description: "Job search and interviews", monthsFromNow: 12 },
  ],
  "Backend Developer": [
    { phase: "Foundation", title: "Programming Language", description: "Python, Node.js, Java, or Go", monthsFromNow: 3 },
    { phase: "Foundation", title: "Database Fundamentals", description: "SQL, PostgreSQL, query optimization", monthsFromNow: 5 },
    { phase: "Skills Building", title: "API Development", description: "REST APIs, authentication, validation", monthsFromNow: 7 },
    { phase: "Skills Building", title: "NoSQL Databases", description: "MongoDB, Redis, caching strategies", monthsFromNow: 8 },
    { phase: "Advanced", title: "System Design", description: "Microservices, message queues, scaling", monthsFromNow: 10 },
    { phase: "DevOps", title: "Deployment", description: "Docker, Kubernetes basics, CI/CD", monthsFromNow: 11 },
    { phase: "Projects", title: "Backend Projects", description: "Build scalable APIs", monthsFromNow: 12 },
    { phase: "Career", title: "Land Backend Role", description: "Job search and interviews", monthsFromNow: 14 },
  ],
  "Data Scientist": [
    { phase: "Foundation", title: "Python Programming", description: "Python, NumPy, Pandas basics", monthsFromNow: 2 },
    { phase: "Foundation", title: "Statistics & Probability", description: "Descriptive stats, hypothesis testing", monthsFromNow: 4 },
    { phase: "Foundation", title: "SQL for Data Analysis", description: "Querying and analyzing data", monthsFromNow: 5 },
    { phase: "Skills Building", title: "Data Visualization", description: "Matplotlib, Seaborn, Plotly", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Machine Learning", description: "Scikit-learn, supervised/unsupervised learning", monthsFromNow: 9 },
    { phase: "Advanced", title: "Deep Learning", description: "TensorFlow/PyTorch, neural networks", monthsFromNow: 12 },
    { phase: "Projects", title: "Kaggle Competitions", description: "Participate in data science competitions", monthsFromNow: 14 },
    { phase: "Projects", title: "End-to-End Projects", description: "Complete data science projects", monthsFromNow: 16 },
    { phase: "Career", title: "Land Data Scientist Role", description: "Job search and interviews", monthsFromNow: 18 },
  ],
  "Machine Learning Engineer": [
    { phase: "Foundation", title: "Python & Mathematics", description: "Linear algebra, calculus, probability", monthsFromNow: 3 },
    { phase: "Foundation", title: "Machine Learning Theory", description: "Algorithms, optimization, evaluation", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Deep Learning", description: "CNN, RNN, Transformers", monthsFromNow: 9 },
    { phase: "Skills Building", title: "MLOps Basics", description: "Model deployment, monitoring", monthsFromNow: 11 },
    { phase: "Advanced", title: "ML System Design", description: "Scalable ML pipelines", monthsFromNow: 13 },
    { phase: "Projects", title: "Production ML Projects", description: "Deploy models to production", monthsFromNow: 15 },
    { phase: "Career", title: "Land MLE Role", description: "Job search and interviews", monthsFromNow: 18 },
  ],
  "DevOps Engineer": [
    { phase: "Foundation", title: "Linux Administration", description: "Command line, shell scripting, networking", monthsFromNow: 2 },
    { phase: "Foundation", title: "Git & Version Control", description: "Advanced Git workflows", monthsFromNow: 3 },
    { phase: "Skills Building", title: "Docker", description: "Containerization, Docker Compose", monthsFromNow: 5 },
    { phase: "Skills Building", title: "CI/CD Pipelines", description: "Jenkins, GitHub Actions, GitLab CI", monthsFromNow: 7 },
    { phase: "Skills Building", title: "Kubernetes", description: "Container orchestration", monthsFromNow: 9 },
    { phase: "Cloud", title: "Cloud Platforms", description: "AWS/GCP/Azure fundamentals", monthsFromNow: 11 },
    { phase: "Advanced", title: "Infrastructure as Code", description: "Terraform, Ansible", monthsFromNow: 13 },
    { phase: "Monitoring", title: "Observability", description: "Prometheus, Grafana, ELK stack", monthsFromNow: 14 },
    { phase: "Career", title: "Land DevOps Role", description: "Job search and interviews", monthsFromNow: 16 },
  ],
  "Cloud Engineer": [
    { phase: "Foundation", title: "Networking Basics", description: "TCP/IP, DNS, load balancing", monthsFromNow: 2 },
    { phase: "Foundation", title: "Linux Fundamentals", description: "System administration basics", monthsFromNow: 3 },
    { phase: "Cloud", title: "AWS/Azure/GCP Core", description: "Compute, storage, networking services", monthsFromNow: 6 },
    { phase: "Cloud", title: "Cloud Security", description: "IAM, security groups, encryption", monthsFromNow: 8 },
    { phase: "Automation", title: "Infrastructure as Code", description: "Terraform, CloudFormation", monthsFromNow: 10 },
    { phase: "Certification", title: "Cloud Certification", description: "AWS SAA or Azure Administrator", monthsFromNow: 12 },
    { phase: "Career", title: "Land Cloud Engineer Role", description: "Job search and interviews", monthsFromNow: 14 },
  ],
  "Mobile App Developer": [
    { phase: "Foundation", title: "Programming Basics", description: "JavaScript/Dart/Kotlin fundamentals", monthsFromNow: 2 },
    { phase: "Framework", title: "React Native/Flutter", description: "Cross-platform development", monthsFromNow: 5 },
    { phase: "Skills Building", title: "State Management", description: "Redux, Provider, Riverpod", monthsFromNow: 7 },
    { phase: "Skills Building", title: "API Integration", description: "REST APIs, GraphQL, Firebase", monthsFromNow: 8 },
    { phase: "Advanced", title: "Native Features", description: "Camera, GPS, notifications", monthsFromNow: 9 },
    { phase: "Projects", title: "Publish Apps", description: "Deploy to App Store/Play Store", monthsFromNow: 11 },
    { phase: "Career", title: "Land Mobile Dev Role", description: "Job search and interviews", monthsFromNow: 14 },
  ],
  "Game Developer": [
    { phase: "Foundation", title: "Programming Basics", description: "C#, C++, or Python", monthsFromNow: 3 },
    { phase: "Engine", title: "Game Engine", description: "Unity or Unreal Engine basics", monthsFromNow: 6 },
    { phase: "Skills Building", title: "2D Game Development", description: "Sprites, physics, animations", monthsFromNow: 8 },
    { phase: "Skills Building", title: "3D Game Development", description: "3D modeling, lighting, shaders", monthsFromNow: 11 },
    { phase: "Advanced", title: "Game Design Principles", description: "Mechanics, level design, UX", monthsFromNow: 13 },
    { phase: "Projects", title: "Complete Games", description: "Build and publish 2-3 games", monthsFromNow: 16 },
    { phase: "Career", title: "Land Game Dev Role", description: "Portfolio and job applications", monthsFromNow: 18 },
  ],
  "Blockchain Developer": [
    { phase: "Foundation", title: "Programming", description: "JavaScript, Python basics", monthsFromNow: 2 },
    { phase: "Foundation", title: "Blockchain Fundamentals", description: "How blockchain works, consensus", monthsFromNow: 4 },
    { phase: "Smart Contracts", title: "Solidity", description: "Ethereum smart contract development", monthsFromNow: 6 },
    { phase: "Smart Contracts", title: "Web3.js/Ethers.js", description: "Interact with blockchain", monthsFromNow: 7 },
    { phase: "DeFi", title: "DeFi Protocols", description: "Understand lending, DEXs, yield", monthsFromNow: 9 },
    { phase: "Projects", title: "DApp Development", description: "Build decentralized applications", monthsFromNow: 11 },
    { phase: "Security", title: "Smart Contract Security", description: "Auditing, common vulnerabilities", monthsFromNow: 13 },
    { phase: "Career", title: "Land Blockchain Dev Role", description: "Job search and interviews", monthsFromNow: 15 },
  ],
  "Security Researcher": [
    { phase: "Foundation", title: "Programming Skills", description: "Python, C, Assembly basics", monthsFromNow: 4 },
    { phase: "Foundation", title: "Networking Deep Dive", description: "Protocols, packet analysis", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Reverse Engineering", description: "Binary analysis, disassembly", monthsFromNow: 9 },
    { phase: "Skills Building", title: "Vulnerability Research", description: "Finding and analyzing vulnerabilities", monthsFromNow: 12 },
    { phase: "Practice", title: "Bug Bounty Programs", description: "HackerOne, Bugcrowd participation", monthsFromNow: 15 },
    { phase: "Advanced", title: "Exploit Development", description: "Writing proof-of-concept exploits", monthsFromNow: 18 },
    { phase: "Career", title: "Land Security Researcher Role", description: "Apply to security teams", monthsFromNow: 24 },
  ],
  "Penetration Tester": [
    { phase: "Foundation", title: "Networking Mastery", description: "TCP/IP, protocols, network security", monthsFromNow: 3 },
    { phase: "Foundation", title: "Linux & Windows", description: "Both OS administration", monthsFromNow: 5 },
    { phase: "Skills Building", title: "Web App Security", description: "OWASP Top 10, Burp Suite", monthsFromNow: 7 },
    { phase: "Skills Building", title: "Network Pentesting", description: "Nmap, Metasploit, privilege escalation", monthsFromNow: 10 },
    { phase: "Practice", title: "CTF & Labs", description: "HackTheBox, TryHackMe", monthsFromNow: 12 },
    { phase: "Certification", title: "OSCP", description: "Offensive Security certification", monthsFromNow: 18 },
    { phase: "Career", title: "Land Pentester Role", description: "Apply to security firms", monthsFromNow: 20 },
  ],
  "default": [
    { phase: "Foundation", title: "Complete Current Education", description: "Finish your current degree/diploma", monthsFromNow: 12 },
    { phase: "Skills Building", title: "Core Technical Skills", description: "Programming, networking, and system fundamentals", monthsFromNow: 18 },
    { phase: "Career Prep", title: "Build Portfolio", description: "Create projects and gain practical experience", monthsFromNow: 24 },
    { phase: "Career", title: "Achieve Your Goal", description: "Land your dream role", monthsFromNow: 36 },
  ],
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    current_weight: 80,
    target_weight: 75,
    current_phase: "BCA Year 1",
    current_education: null,
    education_field: null,
    goal: "PhD in Cyber Security",
    challenges: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name,
        current_weight: Number(data.current_weight),
        target_weight: Number(data.target_weight),
        current_phase: data.current_phase || "BCA Year 1",
        current_education: data.current_education,
        education_field: data.education_field,
        goal: data.goal || "PhD in Cyber Security",
        challenges: data.challenges,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        current_weight: profile.current_weight,
        target_weight: profile.target_weight,
        current_phase: profile.current_phase,
        current_education: profile.current_education,
        education_field: profile.education_field,
        goal: profile.goal,
        challenges: profile.challenges,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved.",
      });
    }
    setSaving(false);
  }

  async function generateRoadmap() {
    if (!user || !profile.goal) return;
    setGeneratingRoadmap(true);

    try {
      // Delete existing milestones
      await supabase
        .from("roadmap_milestones")
        .delete()
        .eq("user_id", user.id);

      // Get the appropriate template
      const template = roadmapTemplates[profile.goal] || roadmapTemplates["default"];

      // Create new milestones based on the goal
      const milestones = template.map((item) => ({
        user_id: user.id,
        phase: item.phase,
        title: item.title,
        description: item.description,
        target_date: new Date(Date.now() + item.monthsFromNow * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: false,
      }));

      const { error } = await supabase
        .from("roadmap_milestones")
        .insert(milestones);

      if (error) throw error;

      toast({
        title: "Roadmap Generated! 🎯",
        description: `Your personalized roadmap for "${profile.goal}" is ready. Check the Roadmap page!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setGeneratingRoadmap(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse-scale" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Add your details to get a personalized roadmap</p>
        </div>

        {/* Profile Card */}
        <Card3D variant="deep" className="animate-slide-up stagger-1 opacity-0">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name || "Researcher"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm text-success">{profile.goal || "PhD in Cyber Security"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>

            {/* Education Info */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEducation">Current Education Level</Label>
                  <select
                    id="currentEducation"
                    value={profile.current_education || ""}
                    onChange={(e) => setProfile({ ...profile, current_education: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select your current education</option>
                    {educationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationField">Field of Study</Label>
                  <Input
                    id="educationField"
                    value={profile.education_field || ""}
                    onChange={(e) => setProfile({ ...profile, education_field: e.target.value })}
                    placeholder="e.g., Electronics & Telecommunication, Computer Science, BCA"
                  />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Your Goal
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">What do you want to achieve?</Label>
                  <select
                    id="goal"
                    value={profile.goal || ""}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select your goal</option>
                    {goalOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Challenges */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Your Challenges
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="challenges">What challenges do you face?</Label>
                <Textarea
                  id="challenges"
                  value={profile.challenges || ""}
                  onChange={(e) => setProfile({ ...profile, challenges: e.target.value })}
                  placeholder="e.g., Limited time for study, Need guidance on resources, Financial constraints, Don't know where to start..."
                  rows={4}
                />
              </div>
            </div>

            {/* Health Goals */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-info" />
                Health Goals
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={profile.current_weight}
                    onChange={(e) => setProfile({ ...profile, current_weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={profile.target_weight}
                    onChange={(e) => setProfile({ ...profile, target_weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card3D>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-2"
            onClick={generateRoadmap}
            disabled={generatingRoadmap || !profile.goal}
          >
            {generatingRoadmap ? (
              <>
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Roadmap
              </>
            )}
          </Button>
          
          <Button
            size="lg"
            className="flex-1 gradient-primary text-primary-foreground gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
