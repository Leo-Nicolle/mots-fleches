import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://tnvxmrqhkdlynhtdzmpw.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnhtcnFoa2RseW5odGR6bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIyNTM0MTEsImV4cCI6MTk5NzgyOTQxMX0.4PczPPAxbkwBvig7NTHNbR8JumuwPPqfyS_kGnkxP5I"
);

supabase.auth.signIn({

  email: ' ',
  password: ' '
});
