import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(1, 'Name is required').max(100),
});

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user, isOfficial, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (isOfficial) {
        navigate('/');
      }
    }
  }, [user, isOfficial, isLoading, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, fullName });
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Login successful');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created. Please wait for admin approval to access the system.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="scan-line w-full h-32" />
      </div>

      <div className="tactical-panel p-8 w-full max-w-md relative">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center animate-pulse-glow">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="font-tactical text-2xl text-primary tracking-wider mb-2">
            SKY-SHIELD
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-2 bg-tactical-amber/10 border border-tactical-amber/30 rounded p-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-tactical-amber shrink-0" />
          <p className="text-[10px] text-tactical-amber">
            This system is restricted to authorized officials. Unauthorized access attempts will be logged.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-tactical">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="text-[10px] text-tactical-red">{errors.fullName}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-tactical">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-tactical-red">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-tactical">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-tactical-red">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-tactical tracking-wider"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                PROCESSING...
              </span>
            ) : (
              <span>{isLogin ? 'ACCESS SYSTEM' : 'REQUEST ACCESS'}</span>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have access? Request credentials" : 'Already have credentials? Sign in'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border/30 text-center">
          <p className="text-[9px] text-muted-foreground">
            SKY-SHIELD DEFENCE SIMULATION SYSTEM • CLASSIFIED
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
