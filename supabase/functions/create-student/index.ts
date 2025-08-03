import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS wrapper
function withCors(res) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(res.body, {
    status: res.status,
    headers
  });
}

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return withCors(new Response("OK", { status: 200 }));
  }

  const { 
    email, 
    password, 
    full_name, 
    phone, 
    student_code, 
    class_instance_id 
  } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"), 
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  // Verify requester is authorized
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: { user: requester }, error: requesterError } = await supabase.auth.getUser(token);
  
  if (requesterError || !requester) {
    return withCors(new Response("Unauthorized", { status: 401 }));
  }

  const isSuperAdminOrAdmin = ['superadmin', 'admin'].includes(requester.user_metadata?.role);
  if (!isSuperAdminOrAdmin) {
    return withCors(new Response("Forbidden", { status: 403 }));
  }

  try {
    // Get school context from requester
    const school_code = requester.user_metadata?.school_code;
    const school_name = requester.user_metadata?.school_name;

    // Create auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        phone,
        school_name,
        school_code,
        role: 'student',
        student_code
      },
      email_confirm: true
    });

    if (createError || !newUser.user) {
      return withCors(new Response(JSON.stringify({
        error: createError.message
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Generate roll number
    const { data: existingStudents } = await supabase
      .from('student')
      .select('roll_number')
      .eq('class_instance_id', class_instance_id)
      .order('roll_number', { ascending: false })
      .limit(1);

    const lastRollNumber = existingStudents?.[0]?.roll_number || 0;
    const rollNumber = lastRollNumber + 1;

    // Insert student record
    const { error: insertError } = await supabase
      .from("student")
      .insert({
        id: newUser.user.id,
        full_name,
        email,
        phone,
        student_code,
        class_instance_id,
        roll_number: rollNumber,
        school_code,
        school_name,
        role: 'student'
      });

    if (insertError) {
      // Clean up auth user if student insert fails
      await supabase.auth.admin.deleteUser(newUser.user.id);
      
      return withCors(new Response(JSON.stringify({
        error: insertError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }));
    }

    return withCors(new Response(JSON.stringify({
      message: "Student created successfully",
      id: newUser.user.id,
      email,
      full_name,
      roll_number: rollNumber,
      student_code,
      class_instance_id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));

  } catch (error) {
    return withCors(new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }));
  }
});