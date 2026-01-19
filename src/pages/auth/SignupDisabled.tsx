import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupDisabled() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to waitlist after 2 seconds
    const timer = setTimeout(() => {
      navigate('/waitlist');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2
          className="text-2xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'MadaniArabic-Bold' }}
        >
          Public Registration Closed
        </h2>
        <p
          className="text-gray-600 mb-6"
          style={{ fontFamily: 'MadaniArabic-Regular' }}
        >
          We're currently not accepting public signups. Contact your administrator for access credentials.
        </p>
        <p
          className="text-sm text-gray-500"
          style={{ fontFamily: 'MadaniArabic-Medium' }}
        >
          Redirecting to waitlist page...
        </p>
      </div>
    </div>
  );
}
