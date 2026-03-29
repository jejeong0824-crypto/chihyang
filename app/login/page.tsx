import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">취향</h1>
        <p className="text-muted-foreground">
          별점 없이, 글로 발견하는 내 취향
        </p>
      </div>
      <LoginButton />
    </div>
  );
}
