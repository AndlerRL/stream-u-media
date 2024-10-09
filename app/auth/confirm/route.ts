import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('otp') ?? ''
  const token_hash = searchParams.get('token_hash') ?? ''
  const email = searchParams.get('email') ?? ''
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('redirect_to') ?? '/'

  if ((token || token_hash) && type) {
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      type,
      token,
      token_hash,
      email,
    })

    console.log('Session created! 🔑 ', session)
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}