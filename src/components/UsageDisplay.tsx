import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Scissors, FileUser, Crown } from 'lucide-react';
import { apiService } from '@/lib/api';

type UsageItem = {
  feature: string;
  used: number;
  limit: string | number;
  remaining: string | number;
  isPremium: boolean;
};

type UsageResponse = {
  usage: UsageItem[];
  isPremium: boolean;
  resetTime: string;
};

const getFeatureIcon = (feature: string) => {
  switch (feature) {
    case 'article-generator': return FileText;
    case 'image-generator': return Image;
    case 'background-remover': return Scissors;
    case 'resume-analyzer': return FileUser;
    default: return FileText;
  }
};

const getFeatureLabel = (feature: string) => {
  switch (feature) {
    case 'article-generator': return 'Article Generator';
    case 'image-generator': return 'Image Generator';
    case 'background-remover': return 'Background Remover';
    case 'resume-analyzer': return 'Resume Analyzer';
    default: return feature;
  }
};

export function UsageDisplay() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['usage'],
    queryFn: apiService.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Loading usage information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Failed to load usage information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const usageData = data as UsageResponse;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>
              {usageData.isPremium ? 'Unlimited Premium Access' : 'Free Plan Limits'}
            </CardDescription>
          </div>
          {usageData.isPremium && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageData.usage.map((item) => {
          const Icon = getFeatureIcon(item.feature);
          const isUnlimited = item.limit === 'Unlimited' || item.limit === Infinity;
          const percentage = isUnlimited ? 0 : Math.min(100, (item.used / Number(item.limit)) * 100);
          
          return (
            <div key={item.feature} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{getFeatureLabel(item.feature)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isUnlimited ? (
                    <span className="text-green-600 font-medium">Unlimited</span>
                  ) : (
                    `${item.used}/${item.limit}`
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <Progress value={percentage} className="h-2" />
              )}
              {!isUnlimited && item.remaining === 0 && (
                <p className="text-xs text-red-600">
                  Daily limit reached. Upgrade to Premium for unlimited access.
                </p>
              )}
            </div>
          );
        })}
        
        {!usageData.isPremium && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Limits reset daily at {new Date(usageData.resetTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 