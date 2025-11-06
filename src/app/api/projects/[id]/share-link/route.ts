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
    return NextResponse.json({ error: 'Sem permissão para atualizar o link' }, { status: 403 });
  }

  const body = await request.json();
  const role = body.role === 'editor' ? 'editor' : 'viewer';

  const service = getServiceClient();
  const token = randomUUID();
  const { data, error } = await service
    .from('projects')
    .update({ share_token: token, share_role: role })
    .eq('id', params.id)
    .select('share_token, share_role')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao atualizar link' }, { status: 500 });
  }

  return NextResponse.json({ shareToken: data.share_token, shareRole: data.share_role });
}

export async function DELETE(
  _request: Request,
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
    return NextResponse.json({ error: 'Sem permissão para remover o link' }, { status: 403 });
  }

  const service = getServiceClient();
  const { error } = await service
    .from('projects')
    .update({ share_token: null, share_role: null })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
