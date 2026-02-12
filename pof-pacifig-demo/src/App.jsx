import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';
import { DrawerProvider } from './components/Drawer';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProductionProvider } from './contexts/ProductionContext';
import { AnimatedBackground } from './components/AnimatedBackground';
import { SettingsToggle } from './components/SettingsToggle';
import { RoleGate } from './views/RoleGate';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Worklist } from './views/Worklist';
import { Landing } from './views/Landing';

function App() {
  const [screen, setScreen] = React.useState('landing'); // landing, roleGate, login, dashboard, worklist
  const [selectedRole, setSelectedRole] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setScreen('login');
  };

  const handleLogin = (userData) => {
    setUser({ ...userData, role: selectedRole });

    // Route based on role
    if (selectedRole === 'OPERATOR') {
      setScreen('worklist');
    } else {
      setScreen('dashboard');
    }
  };

  const switchScreen = (newScreen) => {
    setScreen(newScreen);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setScreen('roleGate');
  };

  const handleBackToRoleGate = () => {
    setSelectedRole(null);
    setScreen('roleGate');
  };

  return (
    <AppProvider>
      <NotificationProvider>
        <ProductionProvider>
          <AnimatedBackground />
          <DrawerProvider>
            <AnimatePresence mode="wait">
              {screen === 'landing' && (
                <motion.div
                  key="landing"
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <Landing onStart={() => setScreen('roleGate')} />
                </motion.div>
              )}

              {screen === 'roleGate' && (
                <motion.div
                  key="roleGate"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <RoleGate onSelectRole={handleSelectRole} />
                </motion.div>
              )}

              {screen === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Login
                    role={selectedRole}
                    onLogin={handleLogin}
                    onBack={handleBackToRoleGate}
                  />
                </motion.div>
              )}

              {screen === 'dashboard' && user && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dashboard user={user} onLogout={handleLogout} onSwitchScreen={switchScreen} />
                </motion.div>
              )}

              {screen === 'worklist' && user && (
                <motion.div
                  key="worklist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Worklist user={user} onLogout={handleLogout} onSwitchScreen={switchScreen} />
                </motion.div>
              )}
            </AnimatePresence>

            <SettingsToggle />
          </DrawerProvider>
        </ProductionProvider>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
