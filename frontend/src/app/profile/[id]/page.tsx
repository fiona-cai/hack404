import { createClient } from '@supabase/supabase-js';
import { notFound } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Fetch user data by id from Supabase
async function getUserById(id: string) {
  if (!id) return null;
  // Fetch from Supabase users table
  const { data, error } = await supabase
    .from('users')
    .select('name, phone_number, interests, avatar')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return {
    name: data.name,
    phoneNumber: data.phone_number,
    interests: data.interests || [],
    avatar: data.avatar || "/images/icon.png"
  };
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);
  if (!user) return notFound();
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", background: "#222", borderRadius: 24, padding: 32, color: "#fff", boxShadow: "0 4px 32px #0006" }}>
      <div style={{ textAlign: "center" }}>
        <img src={`images/${user.avatar}.png`} alt={user.name} style={{ width: 120, height: 120, borderRadius: "50%", border: "3px solid #fff", marginBottom: 16 }} />
        <h2 style={{ fontSize: 32, margin: "16px 0 8px" }}>{user.name}</h2>
        <div style={{ fontSize: 18, color: "#aaa", marginBottom: 12 }}>{user.phoneNumber}</div>
        <div style={{ fontSize: 20, fontWeight: 500, margin: "24px 0 8px" }}>Interests</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {user.interests.map((interest: string) => (
            <span key={interest} style={{ background: "#4e54c8", borderRadius: 16, padding: "6px 16px", fontSize: 16 }}>{interest}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
