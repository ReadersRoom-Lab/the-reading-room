import { UserProfile } from "@clerk/nextjs";
import { ProfileNav } from "@/components/ProfileNav";

export default function ProfilePage() {
  return (
    /*
     * .profile-page provides height: 100vh + flex-col layout.
     * All aggressive Clerk sizing overrides are removed from globals.css.
     * UserProfile renders with NO routing prop so Clerk shows content
     * inline without its own internal navbar — our ProfileNav handles tabs.
     */
    <div className="profile-page">

      {/* Slim breadcrumb bar */}
      <header className="h-11 border-b border-[#E5E5E5] bg-[#F9F7F2] flex items-center px-8 shrink-0">
        <span className="font-sans text-[10px] font-medium tracking-[0.14em] text-[#BDBDBD] uppercase ml-auto">
          Account Settings
        </span>
      </header>

      {/* Two-panel layout with explicit height to avoid flex resolution issues */}
      <div
        className="flex overflow-hidden"
        style={{ height: "calc(100vh - 2.75rem)" }}
      >
        {/* Our custom sidebar */}
        <ProfileNav />

        {/* Clerk content — simple scrollable wrapper, no forced sizing */}
        <div className="flex-1 overflow-y-auto bg-[#F9F7F2]">
            <UserProfile
              routing="hash"
              appearance={{
                variables: {
                  colorPrimary: "#1A1A1A",
                  colorBackground: "#F9F7F2",
                  fontFamily: "var(--font-inter)",
                  borderRadius: "0px",
                },
              }}
            />
        </div>
      </div>
    </div>
  );
}
