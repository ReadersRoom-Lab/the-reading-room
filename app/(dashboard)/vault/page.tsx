import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { VaultContent } from "@/components/VaultContent";

        {/* Source footer */}
        {firstTrail && (
          <div className="mt-auto pt-3 border-t border-[#F0EFEC] flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="w-3 h-3 text-[#BDBDBD] shrink-0" />
              <Link
                href={`/read/${firstTrail.article_id}`}
                className="text-[11px] text-[#52525B] hover:text-[#1A1A1A] truncate transition-colors"
                title={firstTrail.article.title}
              >
                {firstTrail.article.title}
              </Link>
            </div>
            {firstTrail.room && (
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderOpen className="w-3 h-3 text-[#BDBDBD] shrink-0" />
                <Link
                  href={`/rooms/${firstTrail.room_id}`}
                  className="text-[11px] text-[#52525B] hover:text-[#1A1A1A] truncate transition-colors"
                  title={firstTrail.room.name}
                >
                  {firstTrail.room.name}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
function renderSubtitle(loading: boolean, count: number): string {
  if (!loading && count > 0) {
    return `${count} word${count === 1 ? "" : "s"} saved`;
  }
  return "Words saved while reading, with definitions and context.";
}

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(false);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <div className="flex flex-col w-full font-sans">
      <VaultContent initialEntries={vaultEntries} />
    </div>
  );
}
