import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { leadData, scores, analysis } = req.body;

    if (!leadData) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const scoresHtml = scores
      ? Object.entries(scores)
          .filter(([cat]) => cat !== 'Total')
          .map(([cat, val]) => `<tr><td style="padding:6px 12px; border-bottom:1px solid #222;">${cat}</td><td style="padding:6px 12px; border-bottom:1px solid #222; font-weight:bold; color:#C8A869;">${val}/10</td></tr>`)
          .join('')
      : '';

    const signsHtml = analysis?.signs
      ? analysis.signs.map(s => `<li>${s}</li>`).join('')
      : '';

    await resend.emails.send({
      from: 'Diagnóstico <onboarding@resend.dev>',
      to: ['eduardokopeski54@gmail.com'],
      subject: `Novo diagnóstico — ${leadData.company} (${analysis?.total ?? '?'}/100)`,
      html: `
        <div style="font-family:sans-serif; max-width:620px; margin:auto; background:#111; color:#eee; padding:32px; border-radius:12px;">

          <h2 style="color:#C8A869; margin-top:0;">Novo Lead — Diagnóstico Empresarial 2026</h2>

          <table style="width:100%; border-collapse:collapse; margin-bottom:24px; background:#1a1a1a; border-radius:8px; overflow:hidden;">
            <tr><td style="padding:8px 12px; border-bottom:1px solid #222;"><strong>Nome</strong></td><td style="padding:8px 12px; border-bottom:1px solid #222;">${leadData.name}</td></tr>
            <tr><td style="padding:8px 12px; border-bottom:1px solid #222;"><strong>Empresa</strong></td><td style="padding:8px 12px; border-bottom:1px solid #222;">${leadData.company}</td></tr>
            <tr><td style="padding:8px 12px; border-bottom:1px solid #222;"><strong>Email</strong></td><td style="padding:8px 12px; border-bottom:1px solid #222;">${leadData.email}</td></tr>
            <tr><td style="padding:8px 12px; border-bottom:1px solid #222;"><strong>Telefone</strong></td><td style="padding:8px 12px; border-bottom:1px solid #222;">${leadData.phone}</td></tr>
            <tr><td style="padding:8px 12px; border-bottom:1px solid #222;"><strong>Faturamento Mensal</strong></td><td style="padding:8px 12px; border-bottom:1px solid #222;">${leadData.revenue}</td></tr>
            <tr><td style="padding:8px 12px;"><strong>Objetivo 2026</strong></td><td style="padding:8px 12px;">${leadData.goal}</td></tr>
          </table>

          <div style="background:#1a1a1a; border-radius:8px; padding:20px; margin-bottom:24px;">
            <p style="margin:0 0 4px; color:#888; font-size:13px;">RESULTADO GERAL</p>
            <span style="font-size:36px; font-weight:bold; color:#C8A869;">${analysis?.total ?? '?'}/100</span>
            <span style="font-size:16px; color:#aaa; margin-left:12px;">${analysis?.status ?? ''}</span>
            <p style="margin:12px 0 0; color:#ccc; font-size:14px;">${analysis?.description ?? ''}</p>
            ${signsHtml ? `<ul style="color:#aaa; font-size:13px; margin-top:8px;">${signsHtml}</ul>` : ''}
            ${analysis?.conclusion ? `<p style="color:#888; font-style:italic; font-size:13px; margin-bottom:0;">${analysis.conclusion}</p>` : ''}
          </div>

          <h3 style="color:#C8A869;">Pontuações por Área</h3>
          <table style="width:100%; border-collapse:collapse; background:#1a1a1a; border-radius:8px; overflow:hidden;">
            ${scoresHtml}
          </table>

        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao enviar email' });
  }
}
