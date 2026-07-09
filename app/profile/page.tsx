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

      {/* Two-panel layout with responsive height and scrolling rules */}
      <div
        className="flex flex-col md:flex-row overflow-visible md:overflow-hidden h-auto md:h-[calc(100vh-2.75rem)]"
      >
        {/* Our custom sidebar */}
        <ProfileNav />

        {/* Clerk content — simple scrollable wrapper, no forced sizing */}
        <div className="flex-1 overflow-visible md:overflow-y-auto bg-[#F9F7F2]">
            <UserProfile
              routing="hash"
              appearance={{
                variables: {
                  colorPrimary: "#1A1A1A",
                  colorBackground: "#F9F7F2",
                  fontFamily: "var(--font-inter)",
                  borderRadius: "0px",
                },
                elements: {
                  headerTitle: { fontFamily: 'var(--font-source-serif)', fontSize: '1.5rem', color: '#1A1A1A', letterSpacing: '-0.02em', fontWeight: 'bold' },
                  headerSubtitle: { color: '#52525B', fontFamily: 'var(--font-inter)' },
                  profileSectionTitleText: { textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BDBDBD', fontWeight: 'bold', fontFamily: 'var(--font-inter)' },
                  avatarBox: { border: '2px solid #E5E5E5', borderRadius: '0px' },
                  userPreviewMainIdentifier: { fontFamily: 'var(--font-source-serif)', fontWeight: 'bold' },
                  badge: { borderRadius: '0px', border: '1px solid #BDBDBD', backgroundColor: 'transparent', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '9px', padding: '2px 6px' },
                  profileSectionPrimaryButton: { textDecoration: 'underline', textUnderlineOffset: '2px', color: '#1A1A1A', fontWeight: '500' },
                  formButtonPrimary: { backgroundColor: '#1A1A1A', color: '#F9F7F2', borderRadius: '0px', fontWeight: 'bold' },
                  formButtonReset: { border: '1px solid #BDBDBD', borderRadius: '0px', backgroundColor: 'transparent', color: '#1A1A1A' },
                  formFieldInput: { border: '1px solid #BDBDBD', borderRadius: '0px', backgroundColor: '#FFFFFF', color: '#1A1A1A' },
                  formFieldLabel: { textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A1A1A', fontWeight: 'bold' },
                  footer: { display: 'none' },
                  card: { boxShadow: 'none' }
                }
              }}
            />
        </div>
      </div>
    </div>
  );
}
