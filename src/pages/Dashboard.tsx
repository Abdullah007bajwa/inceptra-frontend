import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image, 
  Scissors, 
  FileUser, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UsageDisplay } from '@/components/UsageDisplay';

export default function Dashboard() {
  const tools = [
    {
      title: 'Article Generator',
      description: 'Create compelling articles with AI',
      icon: FileText,
      href: '/dashboard/article-generator',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Image Generator',
      description: 'Generate stunning visuals from text',
      icon: Image,
      href: '/dashboard/image-generator',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Background Remover',
      description: 'Remove backgrounds instantly',
      icon: Scissors,
      href: '/dashboard/background-remover',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Resume Analyzer',
      description: 'Analyze and improve resumes',
      icon: FileUser,
      href: '/dashboard/resume-analyzer',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const stats = [
    { label: 'Articles Generated', value: '24', icon: FileText },
    { label: 'Images Created', value: '18', icon: Image },
    { label: 'Backgrounds Removed', value: '12', icon: Scissors },
    { label: 'Resumes Analyzed', value: '8', icon: FileUser },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Inceptra</h1>
        <p className="text-muted-foreground">
          Choose from our powerful AI tools to bring your ideas to life.
        </p>
      </motion.div>

      {/* Usage Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <UsageDisplay />
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} className="hover:shadow-smooth transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">AI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="hover:shadow-glow transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-lg ${tool.bgColor} flex items-center justify-center`}>
                      <tool.icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={tool.href}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Link to="/dashboard/history">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              View All
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
              <p className="text-muted-foreground">
                Start using our AI tools to see your activity here.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}