import { UserButton as ClerkUserButton, ClerkProvider } from '@clerk/clerk-react';

const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

const appearance = {
  elements: {
    userButtonAvatarBox: 'w-8 h-8',
    userButtonPopoverCard: 'bg-gray-900 border border-gray-800',
    userButtonPopoverText: 'text-gray-300',
    userButtonPopoverActionButton: 'text-gray-300 hover:text-white hover:bg-gray-800'
  }
};

export function UserButton() {
  if (!publishableKey) return null;
  
  return (
    <ClerkProvider publishableKey={publishableKey} appearance={appearance}>
      <ClerkUserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-8 h-8'
          }
        }}
      />
    </ClerkProvider>
  );
} 