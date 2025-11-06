import { addDays } from 'date-fns';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getServiceClient } from '@/lib/supabaseService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!project || project.owner_id !== user.id) {
    return NextResponse.json({ error: 'Sem permissão para convidar colaboradores' }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 422 });
  }

  const role = body.role === 'editor' ? 'editor' : 'viewer';
  const token = randomUUID();
  const expiresAt = addDays(new Date(), 7).toISOString();

  const service = getServiceClient();
  const { error } = await service.from('project_invites').insert({
    project_id: params.id,
    email,
    role,
    token,
    expires_at: expiresAt
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Integrar com Supabase Functions ou serviço externo para enviar email usando o token.

  return NextResponse.json({ success: true });
}
