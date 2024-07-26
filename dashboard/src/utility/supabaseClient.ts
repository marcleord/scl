import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://jcmmxlueleepwputuphv.supabase.co";
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbW14bHVlbGVlcHdwdXR1cGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDE1NTI2NCwiZXhwIjoyMDM1NzMxMjY0fQ.py0Iopwu6N2TCdN8aBuv0JHgHHjQPSTjcIzXfOLFaq4";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: {
        schema: "public",
    },
    auth: {
        persistSession: true,
    },
});