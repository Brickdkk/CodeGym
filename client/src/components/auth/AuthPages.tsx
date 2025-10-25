import React from 'react';
import { Route, Switch } from 'wouter';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export function AuthPages() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Switch>
        <Route path="/login">
          <LoginForm />
        </Route>
        <Route path="/register">
          <RegisterForm />
        </Route>
      </Switch>
    </div>
  );
}
