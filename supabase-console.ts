import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.rpc("random_active_henyo_words", {
    limit_count: 5,
  });

  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

run();
