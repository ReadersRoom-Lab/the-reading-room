import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full">
      <h1 className="text-4xl font-heading font-bold self-start w-full">Account Settings</h1>
      <UserProfile
        appearance={{
          variables: {
            colorPrimary: "#2C2825",
            colorBackground: "#FDFBF7",
            fontFamily: "var(--font-sans)",
            borderRadius: "0.5rem",
          },
          elements: {
            card: "border border-border shadow-sm",
            headerTitle: "font-heading font-bold text-2xl",
          }
        }}
      />
    </div>
  );
}
