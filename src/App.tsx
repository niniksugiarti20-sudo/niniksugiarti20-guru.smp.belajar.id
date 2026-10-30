import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import TeacherView from '@/components/TeacherView';
import StudentView from '@/components/StudentView';

type Role = 'guru' | 'murid' | null;

function App() {
  const [role, setRole] = useState<Role>(null);

  if (role === null) {
    return <LandingPage onSelectRole={setRole} />;
  }

  if (role === 'guru') {
    return <TeacherView onBack={() => setRole(null)} />;
  }

  return <StudentView onBack={() => setRole(null)} />;
}

export default App;
