import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirige automatiquement tout visiteur de la racine (/) vers (/login)
  redirect('/dashboard');
}