import { SignIn, ClerkProvider } from '@clerk/clerk-react';
import type { FC } from 'react';

const SignInComponent: FC = () => {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        layout: {
          helpPageUrl: "https://clerk.dev/support",
          logoImageUrl: "/logo.png",
          logoPlacement: "inside",
          privacyPageUrl: "https://clerk.dev/privacy",
          showOptionalFields: true,
          socialButtonsPlacement: "bottom",
          termsPageUrl: "https://clerk.dev/terms"
        },
        variables: {
          colorPrimary: '#9333ea',
          colorTextOnPrimaryBackground: 'white',
          colorBackground: 'transparent',
          colorText: 'white',
          colorInputText: 'white',
          colorInputBackground: '#1f2937',
          colorTextSecondary: '#9ca3af',
          fontSize: '20px'
        },
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-2xl h-16 mt-4',
          formFieldInput: 'bg-gray-800 border-gray-700 text-xl h-16',
          formFieldLabel: 'text-gray-300 text-xl mb-2',
          card: 'bg-transparent border-0 shadow-none w-full max-w-5xl mx-auto',
          headerTitle: 'text-3xl text-white mb-6',
          headerSubtitle: 'text-gray-400 text-xl mb-8',
          socialButtonsBlockButton: 'border-gray-700 hover:bg-gray-800 text-white text-xl h-16',
          socialButtonsBlockButtonText: 'text-white',
          dividerLine: 'bg-gray-700',
          dividerText: 'text-gray-400 text-xl',
          formFieldLabelRow: 'text-gray-300',
          footer: 'hidden',
          footerActionLink: 'text-purple-500 hover:text-purple-400 text-xl',
          identityPreviewText: 'text-white text-xl',
          identityPreviewEditButton: 'text-purple-500 hover:text-purple-400',
          formResendCodeLink: 'text-purple-500 hover:text-purple-400',
          main: 'w-full max-w-5xl mx-auto p-8',
          form: 'w-full space-y-8',
          formField: 'mb-8',
          socialButtonsIconButton: 'w-16 h-16',
          rootBox: 'min-h-[500px]'
        }
      }}
    >
      <SignIn 
        routing="path" 
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/admin/dashboard"
      />
    </ClerkProvider>
  );
};

export default SignInComponent; 