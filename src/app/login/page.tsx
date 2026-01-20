import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <form className="flex w-full max-w-sm flex-col gap-4 border p-8 rounded-xl shadow-lg bg-white">
        <h1 className="text-2xl font-bold text-center mb-4">Witaj w PeakLog 🏔️</h1>
        
        <label className="text-sm font-medium">Email</label>
        <input name="email" type="email" required className="border p-2 rounded" placeholder="jan@kowalski.pl" />
        
        <label className="text-sm font-medium">Hasło</label>
        <input name="password" type="password" required className="border p-2 rounded" placeholder="••••••••" />
        
        <div className="flex gap-2 mt-4">
          <button formAction={login} className="flex-1 bg-black text-white p-2 rounded hover:bg-gray-800">
            Zaloguj
          </button>
          <button formAction={signup} className="flex-1 bg-white border border-black text-black p-2 rounded hover:bg-gray-100">
            Zarejestruj
          </button>
        </div>
      </form>
    </main>
  );
}
