'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignUpPage, { SignUpPageProps } from '@/components/ui/sign-up';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3030/graphql';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SignUp() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const description = useMemo(() => {
    if (status === 'error') {
      return message ?? 'We could not create your account. Please try again.';
    }

    if (status === 'success') {
      return 'Account created successfully. You can now sign in!';
    }

    if (status === 'loading') {
      return 'Creating your account...';
    }

    return 'Join our community and unlock powerful crowdfunding tools.';
  }, [status, message]);

  const handleSignUp: SignUpPageProps['onSignUp'] = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get('name') ?? '').toString().trim();
    const email = (formData.get('email') ?? '').toString().trim();
    const password = (formData.get('password') ?? '').toString();

    if (!name || !email || !password) {
      setStatus('error');
      setMessage('Name, email, and password are required.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: /* GraphQL */ `
            mutation CreateUser($name: String!, $email: String!, $password: String!) {
              createUser(name: $name, email: $email, password: $password) {
                id
                name
                email
              }
            }
          `,
          variables: { name, email, password },
        }),
      });

      const payload = await response.json();

      if (!response.ok || payload.errors) {
        const errorMessage = payload?.errors?.[0]?.message ?? 'Unable to create your account.';
        setStatus('error');
        setMessage(errorMessage);
        return;
      }

      setStatus('success');
      setMessage('Account created successfully!');
      form.reset();

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (error) {
      console.error('Sign up error', error);
      setStatus('error');
      setMessage('Unexpected error while contacting the server.');
    }
  };

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        description={description}
        heroImageSrc="https://images.unsplash.com/photo-1762234322825-2e748568b00f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3000"
        onSignUp={handleSignUp}
        onSignIn={() => router.push('/login')}
      />
    </div>
  );
}
