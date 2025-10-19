import { signup } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const user = await getAuthUser();
  if (user) {
    redirect('/chat');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form action={signup}>
          <Card className="shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center pb-4">
                <Logo />
              </div>
              <CardTitle className="text-2xl font-headline">
                Create an Account
              </CardTitle>
              <CardDescription>
                Join the collective intelligence. It&apos;s free!
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit">
                Sign Up
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </main>
  );
}
