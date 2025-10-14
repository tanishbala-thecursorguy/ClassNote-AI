"use client";

import React, { useEffect, useRef, useState } from 'react';
import { DottedSurfaceDemo } from './dotted-surface-demo';

interface LoginData {
  organizationUID: string;
  organizationPassword: string;
  stream: string;
  branch: string;
  branchUID: string;
  branchPassword: string;
  role: 'student' | 'teacher';
  teacherUID?: string;
  teacherPassword?: string;
}

interface LoginFlowProps {
  onComplete: () => void;
}

export const LoginFlow = ({ onComplete }: LoginFlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentInterface, setCurrentInterface] = useState(1);
  const [loginData, setLoginData] = useState<LoginData>({
    organizationUID: '',
    organizationPassword: '',
    stream: '',
    branch: '',
    branchUID: '',
    branchPassword: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRoleBasedLogin, setIsRoleBasedLogin] = useState(false); // Track if we're in role-based login phase
  const [showDottedSurface, setShowDottedSurface] = useState(false); // Track when to show dotted surface

  // Interface refs for animations
  const interfaceRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const setInterfaceRef = (index: number) => (el: HTMLDivElement | null) => {
    interfaceRefs.current[index] = el;
  };

  // Stream options
  const streamOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'degree', label: 'Degree' },
    { value: 'mba', label: 'MBA' }
  ];

  // Branch options based on stream
  const getBranchOptions = (stream: string) => {
    switch (stream) {
      case 'engineering':
        return [
          { value: 'cse', label: 'Computer Science Engineering' },
          { value: 'ece', label: 'Electronics & Communication Engineering' },
          { value: 'it', label: 'Information Technology' },
          { value: 'mech', label: 'Mechanical Engineering' }
        ];
      case 'degree':
        return [
          { value: 'bsc', label: 'B.Sc' },
          { value: 'bcom', label: 'B.Com' },
          { value: 'ba', label: 'B.A' }
        ];
      case 'mba':
        return [
          { value: 'hr', label: 'Human Resources' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'finance', label: 'Finance' }
        ];
      default:
        return [];
    }
  };

  // Switch to next interface
  const scrollToInterface = (interfaceNumber: number) => {
    setCurrentInterface(interfaceNumber);
    // Trigger background camera animation
    updateBackgroundCamera(interfaceNumber);
  };

  // Update background camera position
  const updateBackgroundCamera = (interfaceNumber: number) => {
    const cameraPositions = [
      { x: 0, y: 30, z: 300 },    // Section 0 - Organization Login
      { x: 0, y: 40, z: 150 },    // Section 1 - Stream Selection
      { x: 0, y: 50, z: 0 },      // Section 2 - Branch Selection
      { x: 0, y: 60, z: -150 },   // Section 3 - Role Selection & Credentials
      { x: 0, y: 70, z: -300 }    // Section 4 - Welcome Screen
    ];
    
    const targetPos = cameraPositions[interfaceNumber - 1] || cameraPositions[0];
    
    // Dispatch camera update event to background component
    window.dispatchEvent(new CustomEvent('cameraUpdate', { 
      detail: { 
        x: targetPos.x, 
        y: targetPos.y, 
        z: targetPos.z 
      } 
    }));
  };

  // Content is now always visible with CSS

  // Handle organization login
  const handleOrganizationLogin = async () => {
    setIsLoading(true);
    setError('');
    
    // Allow empty fields for testing - just validate that they exist
    if (!loginData.organizationUID.trim() || !loginData.organizationPassword.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call - for now just proceed
    setTimeout(() => {
      setIsLoading(false);
      scrollToInterface(2);
    }, 1000);
  };

  // Handle stream selection
  const handleStreamSelect = (stream: string) => {
    setLoginData(prev => ({ ...prev, stream }));
    // Don't auto-scroll - let user click Continue
  };

  // Handle stream continue
  const handleStreamContinue = () => {
    if (loginData.stream) {
      scrollToInterface(3);
    } else {
      setError('Please select a stream');
    }
  };

  // Handle branch selection
  const handleBranchSelect = (branch: string) => {
    setLoginData(prev => ({ ...prev, branch }));
    // Don't auto-scroll - let user fill in credentials first
  };

  // Handle branch login
  const handleBranchLogin = async () => {
    setIsLoading(true);
    setError('');
    
    if (!loginData.branchUID.trim() || !loginData.branchPassword.trim() || !loginData.branch) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call - for now just proceed
    setTimeout(() => {
      setIsLoading(false);
      scrollToInterface(4);
    }, 1000);
  };

  // Handle role selection
  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setLoginData(prev => ({ ...prev, role }));
    setIsRoleBasedLogin(true); // Mark that we're entering role-based login phase
    setError(''); // Clear any previous errors
    // Go back to Interface 1 but with role-based content
    scrollToInterface(1);
  };

  // Handle back navigation
  const goBack = () => {
    if (isRoleBasedLogin && currentInterface === 1) {
      // If we're in role-based login and on Interface 1, go back to Interface 4
      setIsRoleBasedLogin(false);
      scrollToInterface(4);
    } else if (currentInterface > 1) {
      scrollToInterface(currentInterface - 1);
    }
  };

  // Handle student login
  const handleStudentLogin = async () => {
    setIsLoading(true);
    setError('');
    
    if (!loginData.teacherUID?.trim() || !loginData.teacherPassword?.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call - for now just proceed
    setTimeout(() => {
      setIsLoading(false);
      setError(''); // Clear any errors
      console.log('Student login successful, setting showDottedSurface to true');
      setShowDottedSurface(true); // Show dotted surface instead of calling onComplete
    }, 1000);
  };

  // Handle teacher login
  const handleTeacherLogin = async () => {
    setIsLoading(true);
    setError('');
    
    if (!loginData.teacherUID?.trim() || !loginData.teacherPassword?.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call - for now just proceed
    setTimeout(() => {
      setIsLoading(false);
      setError(''); // Clear any errors
      console.log('Teacher login successful, setting showDottedSurface to true');
      setShowDottedSurface(true); // Show dotted surface instead of calling onComplete
    }, 1000);
  };

  // No redirect needed - login flow ends at role-based login

  // Initialize the first interface as active
  useEffect(() => {
    setCurrentInterface(1);
  }, []);

  // Show DottedSurface after successful login
  if (showDottedSurface) {
    console.log('Showing DottedSurface after successful login');
    return <DottedSurfaceDemo onContinue={onComplete} />;
  }

  return (
    <div ref={containerRef} className="login-flow-container">
      {/* Interface 1 - Organization Login or Role-based Login */}
      <section id="interface-1" className={`login-interface ${currentInterface === 1 ? 'active' : ''}`}>
        <div 
          ref={setInterfaceRef(0)}
          className="interface-content"
        >
          {!isRoleBasedLogin ? (
            <>
              <h1 className="interface-title fade-in">Login to Organization</h1>
              
              <div className="form-group fade-in">
                <input
                  type="text"
                  placeholder="Organization ID / Email"
                  value={loginData.organizationUID}
                  onChange={(e) => setLoginData(prev => ({ ...prev, organizationUID: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              <div className="form-group fade-in">
                <input
                  type="password"
                  placeholder="Organization Password"
                  value={loginData.organizationPassword}
                  onChange={(e) => setLoginData(prev => ({ ...prev, organizationPassword: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              {error && <div className="error-message fade-in">{error}</div>}
              
              <div className="button-row fade-in">
                <button 
                  onClick={goBack}
                  className="back-button"
                  style={{ opacity: currentInterface === 1 && !isRoleBasedLogin ? 0.3 : 1 }}
                  disabled={currentInterface === 1 && !isRoleBasedLogin}
                >
                  ← Back
                </button>
                <button 
                  onClick={handleOrganizationLogin}
                  disabled={isLoading}
                  className="continue-button"
                >
                  {isLoading ? 'Validating...' : 'Continue'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="interface-title fade-in">
                {loginData.role === 'student' ? 'Student Login' : 'Teacher Login'}
              </h1>
              
              <p className="subtext fade-in">
                Enter your {loginData.role} credentials to continue
              </p>
              
              <div className="form-group fade-in">
                <input
                  type="text"
                  placeholder="Unique ID"
                  value={loginData.teacherUID || ''}
                  onChange={(e) => setLoginData(prev => ({ ...prev, teacherUID: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              <div className="form-group fade-in">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.teacherPassword || ''}
                  onChange={(e) => setLoginData(prev => ({ ...prev, teacherPassword: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              {error && <div className="error-message fade-in">{error}</div>}
              
              <div className="button-row fade-in">
                <button 
                  onClick={goBack}
                  className="back-button"
                >
                  ← Back
                </button>
                <button 
                  onClick={loginData.role === 'student' ? handleStudentLogin : handleTeacherLogin}
                  disabled={isLoading}
                  className="continue-button"
                >
                  {isLoading ? 'Validating...' : 'Login'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Interface 2 - Stream Selection */}
      <section id="interface-2" className={`login-interface ${currentInterface === 2 ? 'active' : ''}`}>
        <div 
          ref={setInterfaceRef(1)}
          className="interface-content"
        >
          <h1 className="interface-title fade-in">Select Your Stream</h1>
          
          <div className="options-grid fade-in">
            {streamOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStreamSelect(option.value)}
                className={`option-button ${loginData.stream === option.value ? 'selected' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <p className="subtext fade-in">Choose your course stream to continue</p>
          
          <div className="button-row fade-in">
            <button 
              onClick={goBack}
              className="back-button"
            >
              ← Back
            </button>
            <button 
              onClick={handleStreamContinue}
              className="continue-button"
            >
              Continue
            </button>
          </div>
        </div>
      </section>

      {/* Interface 3 - Branch Selection */}
      <section id="interface-3" className={`login-interface ${currentInterface === 3 ? 'active' : ''}`}>
        <div 
          ref={setInterfaceRef(2)}
          className="interface-content"
        >
          <h1 className="interface-title fade-in">Select Your Branch</h1>
          
          <div className="branch-info fade-in">
            <p>Stream: <strong>{streamOptions.find(s => s.value === loginData.stream)?.label}</strong></p>
          </div>
          
          <div className="options-grid fade-in">
            {getBranchOptions(loginData.stream).map((option) => (
              <button
                key={option.value}
                onClick={() => handleBranchSelect(option.value)}
                className={`option-button ${loginData.branch === option.value ? 'selected' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="form-group fade-in">
            <input
              type="text"
              placeholder="Branch UID"
              value={loginData.branchUID}
              onChange={(e) => setLoginData(prev => ({ ...prev, branchUID: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <div className="form-group fade-in">
            <input
              type="password"
              placeholder="Password"
              value={loginData.branchPassword}
              onChange={(e) => setLoginData(prev => ({ ...prev, branchPassword: e.target.value }))}
              className="input-field"
            />
          </div>
          
          {error && <div className="error-message fade-in">{error}</div>}
          
          <div className="button-row fade-in">
            <button 
              onClick={goBack}
              className="back-button"
            >
              ← Back
            </button>
            <button 
              onClick={handleBranchLogin}
              disabled={isLoading}
              className="continue-button"
            >
              {isLoading ? 'Validating...' : 'Continue'}
            </button>
          </div>
        </div>
      </section>

      {/* Interface 4 - Role Selection */}
      <section id="interface-4" className={`login-interface ${currentInterface === 4 ? 'active' : ''}`}>
         <div 
           ref={setInterfaceRef(3)}
           className="interface-content"
         >
           <h1 className="interface-title fade-in">Continue as</h1>
           
           <div className="role-selection fade-in">
             <button
               onClick={() => handleRoleSelect('student')}
               className={`role-button ${loginData.role === 'student' ? 'selected' : ''}`}
             >
               Student
             </button>
             <button
               onClick={() => handleRoleSelect('teacher')}
               className={`role-button ${loginData.role === 'teacher' ? 'selected' : ''}`}
             >
               Teacher
             </button>
           </div>
           
           <div className="button-row fade-in">
             <button 
               onClick={goBack}
               className="back-button"
             >
               ← Back
             </button>
             <div style={{ flex: 1 }}></div>
           </div>
         </div>
       </section>

    </div>
  );
};
