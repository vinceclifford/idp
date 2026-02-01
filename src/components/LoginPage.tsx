import { useState } from 'react';
import { Trophy, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validation Logic
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // 2. Success Action
    if (isRegister) {
      toast.success('Account created successfully!');
      onLogin();
    } else {
      onLogin();
      toast.success('Welcome back!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0b0f19]">
      
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glass Card Container */}
      <Card animate delay={0.1} className="w-full max-w-md p-8 sm:p-10 z-10 border-white/10 bg-slate-900/60">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20 mb-6"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CoachHub</h1>
          <p className="text-slate-400 mt-2 text-center font-medium">
            {isRegister ? 'Start your coaching journey' : 'Welcome back to the pitch'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Message Animation */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-400 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Centralized Inputs */}
          <Input 
            label="Email Address"
            type="email"
            icon={<Mail size={16} />}
            placeholder="coach@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Pass error boolean or string if specific field validation is needed
            className={error && !email ? "border-red-500/50" : ""}
          />

          <Input 
            label="Password"
            type="password"
            icon={<Lock size={16} />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error && !password ? "border-red-500/50" : ""}
            rightElement={
              <button type="button" className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-medium">
                Forgot?
              </button>
            }
          />

          {/* Centralized Submit Button */}
          <Button type="submit" className="w-full shadow-lg shadow-blue-600/20">
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>

        </form>

        {/* Toggle Register/Login */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-slate-500 text-sm mb-3">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
          </p>
          <Button 
            variant="ghost" 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 w-full"
          >
             {isRegister ? 'Sign in instead' : "Create an account"}
          </Button>
        </div>

      </Card>
    </div>
  );
}