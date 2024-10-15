import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams: reqSearchParams } = new URL(request.url)
  const token = reqSearchParams.get('token') ?? ''
  const email = reqSearchParams.get('email') ?? ''
  const type = reqSearchParams.get('type') as EmailOtpType | null
  const next = reqSearchParams.get('redirect_to') ?? '/'

  console.log('reqSearchParams -> ', reqSearchParams.toString())

  if (token && type) {
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      type,
      token,
      // token_hash,
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