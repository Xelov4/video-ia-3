/**
 * Admin Login Page
 * Authentication interface for admin users
 */

'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, Shield, User, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        // Check if login was successful by getting session
        const session = await getSession();
        if (session) {
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError('Erreur de connexion. Veuillez réessayer.');
        }
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-900 p-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <Link href='/' className='group inline-flex items-center space-x-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg transition-transform group-hover:scale-105'>
              <Sparkles className='h-6 w-6 text-white' />
            </div>
            <div className='text-left'>
              <h1 className='text-2xl font-bold text-white'>Video-IA.net</h1>
              <Badge
                variant='secondary'
                className='border-blue-500 bg-blue-600 text-xs text-white'
              >
                Administration
              </Badge>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <Card className='border-slate-700 bg-slate-800 shadow-2xl'>
          <CardHeader className='pb-6 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700'>
              <Shield className='h-8 w-8 text-blue-400' />
            </div>
            <CardTitle className='text-2xl font-bold text-white'>
              Connexion Admin
            </CardTitle>
            <p className='text-sm text-slate-400'>
              Accédez au tableau de bord d'administration
            </p>
          </CardHeader>

          <CardContent className='space-y-6'>
            {error && (
              <div className='rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Email Field */}
              <div className='space-y-2'>
                <label htmlFor='email' className='text-sm font-medium text-slate-200'>
                  Adresse email
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  <Input
                    id='email'
                    type='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='border-slate-600 bg-slate-700 pl-10 text-white placeholder:text-slate-400'
                    placeholder='admin@video-ia.net'
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='text-sm font-medium text-slate-200'
                >
                  Mot de passe
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='border-slate-600 bg-slate-700 pl-10 pr-10 text-white placeholder:text-slate-400'
                    placeholder='••••••••'
                    disabled={isLoading}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-slate-400 hover:text-white'
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                disabled={isLoading}
                className='h-11 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white hover:from-blue-700 hover:to-purple-700'
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <Separator className='bg-slate-700' />

            {/* Credentials Info */}
            <div className='space-y-4'>
              <div className='text-center'>
                <h4 className='mb-3 text-sm font-medium text-slate-300'>
                  Comptes d'administration disponibles
                </h4>
              </div>

              <div className='space-y-3'>
                <Card className='border-blue-500/20 bg-blue-500/10'>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600'>
                        <User className='h-4 w-4 text-white' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-medium text-blue-200'>
                          Compte Principal
                        </div>
                        <div className='truncate text-xs text-blue-300'>
                          admin@video-ia.net
                        </div>
                        <div className='text-xs text-blue-300'>Admin123!</div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='bg-blue-600 text-xs text-white'
                      >
                        Super Admin
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className='border-green-500/20 bg-green-500/10'>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-600'>
                        <User className='h-4 w-4 text-white' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-medium text-green-200'>
                          Compte Secondaire
                        </div>
                        <div className='truncate text-xs text-green-300'>
                          admin2@video-ia.net
                        </div>
                        <div className='text-xs text-green-300'>Admin456!</div>
                      </div>
                      <Badge
                        variant='secondary'
                        className='bg-green-600 text-xs text-white'
                      >
                        Admin
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className='bg-slate-700' />

            {/* Back to Site */}
            <div className='text-center'>
              <Link
                href='/'
                className='group inline-flex items-center space-x-2 text-sm text-slate-400 transition-colors hover:text-white'
              >
                <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                <span>Retour au site</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
