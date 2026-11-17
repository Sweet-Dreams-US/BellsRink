import { supabase } from './supabase'

type Submission = {
  form: 'contact' | 'newsletter'
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  /** Any other answers on the form, shown as label/value pairs in the admin. */
  extra?: Record<string, string>
}

const clean = (value?: string) => {
  const trimmed = (value ?? '').trim()
  return trimmed ? trimmed : null
}

/**
 * Saves a website form submission so it shows up at /admin. Resolves to whether it was
 * saved, and never throws, so a form can treat it as one of several places it delivers to.
 */
export async function saveSubmission(submission: Submission): Promise<boolean> {
  try {
    const extra: Record<string, string> = {}
    Object.entries(submission.extra ?? {}).forEach(([label, value]) => {
      const cleaned = clean(value)
      if (cleaned) extra[label] = cleaned
    })

    const { error } = await supabase.from('form_submissions').insert({
      form: submission.form,
      name: clean(submission.name),
      email: clean(submission.email),
      phone: clean(submission.phone),
      subject: clean(submission.subject),
      message: clean(submission.message),
      extra,
    })
    return !error
  } catch {
    return false
  }
}
