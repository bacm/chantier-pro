import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Register</h1>
        <p className="text-center text-gray-600">Authentication forms will go here.</p>
      </div>
    </div>
  );
};

export default AuthPage;
