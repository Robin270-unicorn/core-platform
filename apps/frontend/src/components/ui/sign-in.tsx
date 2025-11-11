'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light tracking-tighter text-foreground">Welcome</span>,
  description = 'Access your account and continue your journey with us',
  heroImageSrc,
  onSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="font-geist flex h-[100dvh] w-[100dvw] flex-col md:flex-row">
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl font-semibold leading-tight md:text-5xl">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300 space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="border-none bg-transparent text-sm focus-visible:ring-violet-400/50"
                  />
                </div>
              </div>

              <div className="animate-element animate-delay-400 space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm">
                  <div className="relative flex items-center">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="border-none bg-transparent pr-12 text-sm focus-visible:ring-violet-400/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="cursor-pointer text-foreground/90"
                  >
                    Keep me signed in
                  </Label>
                </div>
                <input type="hidden" name="rememberMe" value={rememberMe ? 'on' : ''} />
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onResetPassword?.();
                  }}
                  className="text-violet-400 transition-colors hover:underline"
                >
                  Reset password
                </a>
              </div>

              <Button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl py-4 text-base">
                Sign In
              </Button>
            </form>

            <p className="animate-element animate-delay-800 text-center text-sm text-muted-foreground">
              New to our platform?{' '}
              <Button
                type="button"
                variant="link"
                className="px-1 text-violet-400"
                onClick={(event) => {
                  event.preventDefault();
                  onCreateAccount?.();
                }}
              >
                Create Account
              </Button>
            </p>
          </div>
        </div>
      </section>

      {heroImageSrc && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  );
};

export default SignInPage;
