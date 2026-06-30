import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <SignUp
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
            headerSubtitle: "text-muted-foreground",
          }
        }}
      />
    </div>
  );
}
